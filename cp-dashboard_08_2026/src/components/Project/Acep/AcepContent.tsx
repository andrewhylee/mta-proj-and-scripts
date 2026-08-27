'use client';

import dayjs from 'dayjs';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { IconInfoCircle } from '@tabler/icons-react';
import { useAtom } from 'jotai';
import { DataTable } from 'mantine-datatable';
import { HoverCard, LoadingOverlay, NumberFormatter, UnstyledButton } from '@mantine/core';
import { AcepDataItem, getAcepData, getProjectsForAcep } from '@/data/Helpers/AcepData';
import { ProjectDetail, projectsAtom } from '@/data/Helpers/ProjectData';
import styles from './AcepContent.module.css';

const AcepContent: React.FC<{
  acep: string;
  isForModal: boolean;
  handleAcepDataLoaded?: (data: AcepDataItem[]) => void;
  handleBackButtonClick?: () => void;
}> = ({ acep, isForModal, handleAcepDataLoaded, handleBackButtonClick }) => {
  const [acepData, setAcepData] = useState<AcepDataItem[]>([]);
  const [projects] = useAtom(projectsAtom);
  const [projectsForAcep, setProjectsForAcep] = useState<ProjectDetail[]>([]);
  const [, setWorkingAcep] = useState<string | null>(acep);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

  const fetchAcepData = async () => {
    let data = JSON.parse(sessionStorage.getItem(`acepData-${acep}`) || 'null');
    if (!data) {
      data = await getAcepData(acep);
      if (data) {
        sessionStorage.setItem(`acepData-${acep}`, JSON.stringify(data));
      }
    }

    if (data) {
      const formattedData = data.map((item: AcepDataItem, index: number) => ({
        ...item,
        date: item.date ? dayjs(item.date).format("MMM 'YY") : undefined,
        revision_type: item.plan_revision
          ? item.plan_revision === '0'
            ? 'Original Plan'
            : 'Amendment'
          : 'N/A',
        id: index, // Use the index as a unique ID
      }));

      setAcepData(formattedData);
      if (handleAcepDataLoaded) {
        handleAcepDataLoaded(formattedData);
      }
    } else {
      setAcepData([]);
    }
  };

  const fetchAcepProjects = async () => {
    let data = JSON.parse(sessionStorage.getItem(`acepProjects-${acep}`) || 'null');
    if (!data) {
      data = await getProjectsForAcep(acep);
      if (data) {
        sessionStorage.setItem(`acepProjects-${acep}`, JSON.stringify(data));
      }
    }

    if (data) {
      const acepProjects = data
        .map((projectId: number) => {
          return projects.find(
            (p) => Math.floor(Number(p.project_id)) === Math.floor(Number(projectId))
          );
        })
        .filter((p: ProjectDetail | undefined): p is ProjectDetail => p !== undefined);

      setProjectsForAcep(acepProjects);
    } else {
      setProjectsForAcep([]);
    }
  };

  useEffect(() => {
    if (acep) {
      setWorkingAcep(acep);
      setIsLoading(true);

      Promise.all([fetchAcepData(), fetchAcepProjects()]).then(() => {
        setIsLoading(false);
      });
    }
  }, [acep]);

  const renderAmount = (record: AcepDataItem, field: keyof AcepDataItem) => {
    const amount = record[field] as string | undefined;

    return amount === undefined || amount.length === 0 || amount === '-' ? (
      '-'
    ) : (
      <span>
        $<NumberFormatter thousandSeparator decimalScale={0} value={amount} />
      </span>
    );
  };

  const columns = [
    {
      accessor: 'date',
      title: 'Date',
      render: (record: AcepDataItem) => {
        return (
          <div className={styles.acepNarrative}>
            <div>{record.date}</div>
            {record.change_nar && record.change_nar.trim().length > 0 && (
              <div className={styles.infoIcon}>
                <HoverCard width={290} shadow="md" position="right" withArrow>
                  <HoverCard.Target>
                    <IconInfoCircle />
                  </HoverCard.Target>
                  <HoverCard.Dropdown className={styles.hoverCard}>
                    <span className={styles.hoverText}>{record.change_nar}</span>
                  </HoverCard.Dropdown>
                </HoverCard>
              </div>
            )}
          </div>
        );
      },
      titleClassName: styles.blueTableHeader,
      cellsClassName: styles.blueTableRow,
    },
    {
      accessor: 'year_1_allocation',
      title: (
        <>
          Year 1 <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'year_1_allocation'),
    },
    {
      accessor: 'year_2_allocation',
      title: (
        <>
          Year 2 <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'year_2_allocation'),
    },
    {
      accessor: 'year_3_allocation',
      title: (
        <>
          Year 3 <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'year_3_allocation'),
    },
    {
      accessor: 'year_4_allocation',
      title: (
        <>
          Year 4 <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'year_4_allocation'),
    },
    {
      accessor: 'year_5_allocation',
      title: (
        <>
          Year 5 <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'year_5_allocation'),
    },
    {
      accessor: 'out_years_allocation',
      title: (
        <>
          Out Years <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      render: (record: AcepDataItem) => renderAmount(record, 'out_years_allocation'),
    },
    {
      accessor: 'total_allocation',
      title: (
        <>
          Total <br />
          Allocation
        </>
      ),
      titleClassName: styles.grayTableHeader,
      cellsClassName: styles.lightGrayCell,
      render: (record: AcepDataItem) => renderAmount(record, 'total_allocation'),
    },
  ];

  return (
    <>
      <LoadingOverlay
        visible={isLoading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'var(--blue-color)', type: 'bars' }}
      />
      <div className={styles.modalContent}>
        {isForModal && (
          <UnstyledButton className={styles.backButton} onClick={handleBackButtonClick}>
            &lt; Back
          </UnstyledButton>
        )}
        <div className={styles.modalContentHeader}>
          <div className={styles.modalContentHeaderLine}>
            <div className={styles.modalContentHeaderTitle}>{acepData[0]?.title}</div>
          </div>
          <div className={styles.modalContentHeaderDescriptionContainer}>
            <div className={styles.modalContentHeaderDescription}>{acepData[0]?.description}</div>
            <div className={styles.projectDetailsContainer}>
              <div className={styles.agenciesContainer}>
                <div className={styles.modalContentHeaderText}>Asset Category: </div>
                <div className={styles.projectDetailText}>{acepData[0]?.category_description}</div>
              </div>
              <div className={styles.agenciesContainer}>
                <div className={styles.modalContentHeaderText}>Element: </div>
                <div className={styles.projectDetailText}>{acepData[0]?.element_description}</div>
              </div>
              <div className={styles.agenciesContainer}>
                <div className={styles.modalContentHeaderText}>Need Code: </div>
                <div className={styles.projectDetailText}>{acepData[0]?.needs_code}</div>
              </div>
              <div className={styles.agenciesContainer}>
                <div className={styles.modalContentHeaderText}>Projects Funded: </div>
                <div className={styles.projectDetailText}>
                  {projectsForAcep.map((project, idx) => (
                    <React.Fragment key={project.project_id}>
                      <UnstyledButton
                        className={styles.projectLink}
                        onClick={() => {
                          if (handleBackButtonClick) {
                            handleBackButtonClick();
                          }
                          router.push(
                            `${window.location.pathname}?projectId=${project.project_id}&cb=${Date.now()}`
                          );
                        }}
                      >
                        {project.title}
                      </UnstyledButton>
                      {idx < projectsForAcep.length - 1 && ', '}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.contentContainer}>
          <div className={styles.modalContentHeaderText}>Budget History</div>
          <div>
            <DataTable<AcepDataItem>
              id={`acep-${acep}`}
              columns={columns}
              records={acepData}
              classNames={{ root: styles.table, header: styles.tableHeader }}
              rowClassName={styles.row}
              key={acep}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default AcepContent;
