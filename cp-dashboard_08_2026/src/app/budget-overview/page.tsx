'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { IconBuilding, IconChevronRight, IconFileText } from '@tabler/icons-react';
import clsx from 'clsx';
import { DataTable, DataTableColumn } from 'mantine-datatable';
import { Box, NumberFormatter } from '@mantine/core';
import BudgetTreemap from '@/components/BudgetTreemap/BudgetTreemap';
import MapTableToggle from '@/components/Map/Header/MapTableToggle';
import budgetOverviewData from '@/data/budget-overview.json';
import Layout from '@/Layout';
import { BudgetOverviewItem } from '@/types/budget-types';
import styles from './page.module.css';

const typedBudgetOverviewData = budgetOverviewData as BudgetOverviewItem[];

const commonColumns: DataTableColumn<BudgetOverviewItem>[] = [
  {
    accessor: 'code',
    title: 'Code',
    textAlign: 'right',
    width: 105,
  },
  {
    accessor: 'needs_code',
    title: 'Needs Code',
    textAlign: 'right',
    width: 120,
  },
  {
    accessor: 'total_allocation',
    title: 'Total Allocation',
    textAlign: 'right',
    width: 150,
    render: (item) => (
      <>
        $<NumberFormatter thousandSeparator decimalScale={0} value={item.total_allocation} />
      </>
    ),
  },
];

function BudgetOverviewPage() {
  const [expandedCapitalPlanIds, setExpandedCapitalPlanIds] = useState<string[]>([]);
  const [expandedAgencyIds, setExpandedAgencyIds] = useState<string[]>([]);
  const [expandedCategoryIds, setExpandedCategoryIds] = useState<string[]>([]);
  const [expandedElementIds, setExpandedElementIds] = useState<string[]>([]);
  const [budgetData, setBudgetData] = useState<BudgetOverviewItem[]>([]);
  const [isTableSelected, setIsTableSelected] = useState(true);
  const budgetOverviewContainerRef = useRef(null);
  const router = useRouter();

  const openModal = (acep: string) => {
    router.push(`${window.location.pathname}?acepId=${acep}&cb=${Date.now()}`);
  };

  useEffect(() => {
    const addIds = (items: BudgetOverviewItem[]): BudgetOverviewItem[] =>
      items.map((item) => ({
        ...item,
        id: item.code,
        children: item.children ? addIds(item.children) : undefined,
      }));

    const data = addIds(typedBudgetOverviewData);

    data.sort((a, b) => b.code.localeCompare(a.code));

    setBudgetData(data);
  }, []);

  const handleMapToggleChangedEvent = (isTable: boolean) => {
    setIsTableSelected(isTable);
  };

  return (
    <Layout>
      <div ref={budgetOverviewContainerRef} className={styles.budgetOverviewContainer}>
        <div>
          This view groups investments by ACEP budget codes, which represent funding categories
          within the Capital Program rather than individual projects. Unlike the project-based view
          elsewhere on the Dashboard, these figures show how the overall program is structured and
          funded across major investment areas. To learn more about the difference between ACEPs and
          Projects, read{' '}
          <Link
            href="https://www.mta.info/article/behind-capital-program-dashboard-part-2-reporting-based-projects"
            target="_blank"
            rel="noopener noreferrer"
          >
            here
          </Link>
          .
        </div>
        <div className={styles.mapToggleContainer}>
          <MapTableToggle
            mapTableToggleChangedEvent={handleMapToggleChangedEvent}
            showInfoIcon={false}
            defaultSelectionToTable={isTableSelected}
            mapLabel="Treemap"
          />
        </div>
        <DataTable<BudgetOverviewItem>
          classNames={{
            root: clsx(isTableSelected ? 'showBlock' : 'noShow', styles.table),
            header: styles.header,
          }}
          scrollAreaProps={{ style: { overflowX: 'hidden' } }}
          rowClassName={styles.row}
          withTableBorder
          withColumnBorders
          highlightOnHover
          columns={[
            {
              accessor: 'name',
              title: 'Capital Plan / Agency / Category / Element / Project ($ in Thousands)',
              noWrap: true,
              render: ({ code, description }) => (
                <>
                  <IconChevronRight
                    className={clsx(styles.icon, styles.expandIcon, {
                      [styles.expandIconRotated]: expandedCapitalPlanIds.includes(code),
                    })}
                  />
                  <IconFileText className={styles.icon} />
                  <span>
                    {description}{' '}
                    {description?.indexOf('2005') !== -1 ? (
                      <span className={styles.asterisk}>*</span>
                    ) : null}
                  </span>
                </>
              ),
            },
            ...commonColumns,
          ]}
          records={budgetData}
          rowExpansion={{
            allowMultiple: true,
            expanded: {
              recordIds: expandedCapitalPlanIds,
              onRecordIdsChange: setExpandedCapitalPlanIds,
            },
            content: (item) => (
              <DataTable<BudgetOverviewItem>
                noHeader
                withColumnBorders
                classNames={{ table: styles.nestedTable }}
                scrollAreaProps={{ style: { overflowX: 'hidden' } }}
                rowClassName={styles.row}
                columns={[
                  {
                    accessor: 'name',
                    noWrap: true,
                    render: ({ code, description }) => (
                      <Box component="span" ml={20}>
                        <IconChevronRight
                          className={clsx(styles.icon, styles.expandIcon, {
                            [styles.expandIconRotated]: expandedAgencyIds.includes(code),
                          })}
                        />
                        <IconBuilding className={styles.icon} />
                        <span>{description}</span>
                      </Box>
                    ),
                  },
                  ...commonColumns,
                ]}
                records={(item.record.children as BudgetOverviewItem[]) ?? []}
                rowExpansion={{
                  allowMultiple: true,
                  expanded: {
                    recordIds: expandedAgencyIds,
                    onRecordIdsChange: setExpandedAgencyIds,
                  },
                  content: (budgetOverviewItem) => (
                    <DataTable<BudgetOverviewItem>
                      noHeader
                      rowClassName={styles.row}
                      withColumnBorders
                      classNames={{ table: styles.nestedTable }}
                      scrollAreaProps={{ style: { overflowX: 'hidden' } }}
                      columns={[
                        {
                          accessor: 'name',
                          noWrap: true,
                          render: ({ code, description }) => (
                            <Box component="span" ml={20}>
                              <IconChevronRight
                                className={clsx(styles.icon, styles.expandIcon, {
                                  [styles.expandIconRotated]: expandedCategoryIds.includes(code),
                                })}
                              />

                              <span>{description}</span>
                            </Box>
                          ),
                        },
                        ...commonColumns,
                      ]}
                      records={(budgetOverviewItem.record.children as BudgetOverviewItem[]) ?? []}
                      rowExpansion={{
                        allowMultiple: true,
                        expanded: {
                          recordIds: expandedCategoryIds,
                          onRecordIdsChange: setExpandedCategoryIds,
                        },
                        content: (budgetOverviewItem) => (
                          <DataTable<BudgetOverviewItem>
                            noHeader
                            rowClassName={styles.row}
                            withColumnBorders
                            scrollAreaProps={{ style: { overflowX: 'hidden' } }}
                            classNames={{ table: styles.nestedTable }}
                            columns={[
                              {
                                accessor: 'name',
                                render: ({ code, description }) => (
                                  <Box component="span" ml={20}>
                                    <IconChevronRight
                                      className={clsx(styles.icon, styles.expandIcon, {
                                        [styles.expandIconRotated]:
                                          expandedElementIds.includes(code),
                                      })}
                                    />
                                    <span>{description}</span>
                                  </Box>
                                ),
                              },
                              ...commonColumns,
                            ]}
                            records={
                              (budgetOverviewItem.record.children as BudgetOverviewItem[]) ?? []
                            }
                            rowExpansion={{
                              allowMultiple: true,
                              expanded: {
                                recordIds: expandedElementIds,
                                onRecordIdsChange: setExpandedElementIds,
                              },
                              content: (budgetOverviewItem) => (
                                <DataTable<BudgetOverviewItem>
                                  rowClassName={styles.row}
                                  noHeader
                                  classNames={{ table: styles.nestedTable }}
                                  scrollAreaProps={{ style: { overflowX: 'hidden' } }}
                                  withColumnBorders
                                  columns={[
                                    {
                                      accessor: 'name',
                                      render: ({ description, code }) => (
                                        <button
                                          type="button"
                                          className={styles.acepButton}
                                          onClick={() => openModal(code)}
                                        >
                                          <span>{description}</span>
                                        </button>
                                      ),
                                    },
                                    {
                                      accessor: 'code',
                                      title: 'Code',
                                      textAlign: 'right',
                                      width: 105,
                                      render: ({ code }) => <span>{code}</span>,
                                    },
                                    ...commonColumns.filter((column) => column.accessor !== 'code'),
                                  ]}
                                  records={
                                    (budgetOverviewItem.record.children as BudgetOverviewItem[]) ??
                                    []
                                  }
                                />
                              ),
                            }}
                          />
                        ),
                      }}
                    />
                  ),
                }}
              />
            ),
          }}
        />
        <BudgetTreemap
          show={!isTableSelected}
          width={
            budgetOverviewContainerRef.current
              ? (budgetOverviewContainerRef.current as HTMLDivElement).offsetWidth
              : 400 // arbitrary width in case ref fails to work (it shouldn't)
          }
        />
        <div className={styles.disclaimer}>
          <span>
            <span className={styles.asterisk}>*</span>
            &nbsp;Data for the 2005-2009 Plan is incomplete and includes select ACEPs from a subset
            of agencies. For this plan, no data is presented for MTA Bus and MTA Interagency.
          </span>
        </div>
      </div>
    </Layout>
  );
}

export default function WrappedBudgetOverviewPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BudgetOverviewPage />
    </Suspense>
  );
}
