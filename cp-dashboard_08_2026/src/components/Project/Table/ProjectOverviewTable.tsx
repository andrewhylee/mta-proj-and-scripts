import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { useEffect, useState } from 'react';
import sortBy from 'lodash/sortBy';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { NumberFormatter } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import styles from './ProjectOverviewTable.module.css';

dayjs.extend(customParseFormat);

export function ProjectOverviewTable({
  projectDetails,
  isVisible,
  uniqueId = 'project-overview-table',
  handleProjectSelected,
  height = 600,
}: {
  projectDetails: ProjectDetail[];
  isVisible?: boolean;
  uniqueId?: string;
  handleProjectSelected?: (projectId: number) => void;
  height?: number;
}) {
  const [sortedData, setSortedData] = useState<ProjectDetail[]>(projectDetails);
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus<ProjectDetail>>({
    columnAccessor: 'is_active',
    direction: 'asc',
  });
  const [selectedProject] = useState<ProjectDetail | null>(null);
  const isMobile = useMediaQuery('(max-width: 600px)');

  useEffect(() => {
    const tableElement = document.querySelector(`#${uniqueId}`) as HTMLElement;

    if (tableElement) {
      tableElement.style.display = isVisible ? 'table' : 'none';
    }
  }, [isVisible]);

  useEffect(() => {
    const data = sortBy(sortedData, sortStatus.columnAccessor) as ProjectDetail[];
    setSortedData(sortStatus.direction === 'desc' ? data.reverse() : data);
  }, [sortStatus]);

  useEffect(() => {
    // Sort by estimated_actual_completion date ascending by default
    const sorted = [...projectDetails].sort((a, b) => {
      const dateA = a.estimated_actual_completion_date
        ? dayjs(a.estimated_actual_completion_date, 'YYYY-MM-DD').toDate().getTime()
        : Number.POSITIVE_INFINITY;
      const dateB = b.estimated_actual_completion_date
        ? dayjs(b.estimated_actual_completion_date, 'YYYY-MM-DD').toDate().getTime()
        : Number.POSITIVE_INFINITY;
      return dateA - dateB;
    });
    setSortedData(sorted);

    //get element with class mantine-datatable-header-cell-sortable-unsorted-icon and set its color to black
    const unsortedIcons = document.querySelectorAll(
      '.mantine-datatable-header-cell-sortable-unsorted-icon'
    );
    unsortedIcons.forEach((icon) => {
      (icon as HTMLElement).style.color = 'black';
    });
  }, []);

  const columns = [
    { accessor: 'project_id', title: 'ID', width: '80px' },
    {
      accessor: 'title',
      title: 'Project Name',
      render: (record: ProjectDetail) => {
        function handleProjectNameButtonClick(record: ProjectDetail): void {
          if (handleProjectSelected) {
            handleProjectSelected(record.project_id);
          }
        }

        return (
          <button
            type="button"
            className={styles.projectNameButton}
            onClick={() => handleProjectNameButtonClick(record)}
          >
            {record.title}
          </button>
        );
      },
    },
    {
      accessor: 'status',
      title: 'Phase',
      render: (record: ProjectDetail) => (
        <div className={styles.phaseContainer}>
          <div className={styles.activeStatusContainer}>
            <object
              data={
                record.is_active ? '/project/active-status.svg' : '/project/inactive-status.svg'
              }
              type="image/svg+xml"
              width="100%"
              height="100%"
              aria-label={record.is_active ? 'Active Status' : 'Inactive Status'}
            />
          </div>
          <div>{record.phase}</div>
        </div>
      ),
    },
    {
      accessor: 'start_date',
      title: 'Start',
      render: (record: ProjectDetail) => (
        <div>
          {record.start_date && dayjs(record.start_date, 'YYYY-MM-DD').isValid() ? (
            <>
              <div>{dayjs(record.start_date).format('MMM YYYY')}</div>
              {dayjs(record.start_date).isAfter(dayjs()) && (
                <div className={styles.smallText}>Expected</div>
              )}
            </>
          ) : null}
        </div>
      ),
    },
    {
      accessor: 'estimated_actual_completion',
      title: 'Completion',
      sortStatus: {
        columnAccessor: 'estimated_actual_completion',
        direction: 'asc',
      },
      sortable: true,
      render: (record: ProjectDetail) => (
        <div>
          {record.estimated_actual_completion_date &&
          dayjs(record.estimated_actual_completion_date, 'YYYY-MM-DD').isValid() ? (
            <>
              <div>{dayjs(record.estimated_actual_completion_date).format('MMM YYYY')}</div>
              {dayjs(record.estimated_actual_completion_date).isAfter(dayjs()) && (
                <div className={styles.smallText}>Expected</div>
              )}
            </>
          ) : null}
        </div>
      ),
    },
    {
      accessor: 'estimated_actual_project',
      title: 'Budget',
      sortable: true,
      render: (record: ProjectDetail) => (
        <span className={styles.budget}>
          {record.estimated_actual_project_cost ? (
            <>
              ${' '}
              <NumberFormatter
                thousandSeparator
                decimalScale={0}
                value={record.estimated_actual_project_cost}
              />
            </>
          ) : (
            'Pending'
          )}
        </span>
      ),
    },
    {
      accessor: 'asset_categories',
      title: 'Asset Categories',
      render: (record: ProjectDetail) => {
        return <span>{record.asset_categories ? record.asset_categories.join(', ') : 'N/A'}</span>;
      },
    },
  ];

  return (
    <>
      <DataTable<ProjectDetail>
        id={uniqueId}
        columns={columns}
        records={sortedData}
        classNames={{ root: styles.table, header: styles.header }}
        rowClassName={styles.row}
        sortStatus={sortStatus}
        onSortStatusChange={setSortStatus}
        key={selectedProject?.project_id}
        style={{ display: isVisible ? 'flex' : 'none' }}
        height={isMobile ? undefined : height}
      />
    </>
  );
}
