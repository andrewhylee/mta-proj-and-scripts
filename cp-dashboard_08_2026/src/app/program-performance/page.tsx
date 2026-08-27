'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAtom } from 'jotai';
import { DataTable } from 'mantine-datatable';
import { UnstyledButton } from '@mantine/core';
import ProgramPerformancePieChart from '@/components/ProgramPerformance/ProgramPerformancePieChart';
import { filteredProjectsAtom, ProjectDetail } from '@/data/Helpers/ProjectData';
import Layout from '@/Layout';
import styles from './page.module.css';

const clockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30" fill="none">
    <rect width="30" height="30" rx="15" fill="currentColor" />
    <path
      d="M15 5C9.489 5 5 9.489 5 15C5 20.511 9.489 25 15 25C20.511 25 25 20.511 25 15C25 9.489 20.511 5 15 5ZM15 7C19.4301 7 23 10.5699 23 15C23 19.4301 19.4301 23 15 23C10.5699 23 7 19.4301 7 15C7 10.5699 10.5699 7 15 7ZM14 9V15.4141L18.293 19.707L19.707 18.293L16 14.5859V9H14Z"
      fill="white"
    />
  </svg>
);

const budgetIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 31 31" fill="none">
    <rect x="0.578125" y="0.0270996" width="30" height="30" rx="15" fill="currentColor" />
    <path
      d="M15.5781 5.0271C10.0671 5.0271 5.57812 9.5161 5.57812 15.0271C5.57812 20.5381 10.0671 25.0271 15.5781 25.0271C21.0891 25.0271 25.5781 20.5381 25.5781 15.0271C25.5781 9.5161 21.0891 5.0271 15.5781 5.0271ZM15.5781 7.0271C20.0082 7.0271 23.5781 10.597 23.5781 15.0271C23.5781 19.4572 20.0082 23.0271 15.5781 23.0271C11.148 23.0271 7.57812 19.4572 7.57812 15.0271C7.57812 10.597 11.148 7.0271 15.5781 7.0271ZM14.5781 8.0271V9.72632C14.4191 9.77532 14.268 9.83396 14.125 9.90796C13.817 10.068 13.552 10.276 13.332 10.531C13.111 10.787 12.9413 11.0845 12.8223 11.4275C12.7043 11.7725 12.6445 12.1531 12.6445 12.5701C12.6445 13.0511 12.7108 13.4633 12.8438 13.8123C12.9777 14.1613 13.1662 14.4663 13.4082 14.7263C13.6502 14.9863 13.9393 15.2158 14.2793 15.4138C14.6193 15.6128 14.9991 15.8021 15.4141 15.9841C15.6561 16.0871 15.8603 16.1945 16.0273 16.3025C16.1953 16.4095 16.3315 16.528 16.4375 16.656C16.5425 16.784 16.621 16.9248 16.668 17.0818C16.714 17.2388 16.7363 17.4217 16.7363 17.6267C16.7363 17.8077 16.7112 17.9756 16.6602 18.1306C16.6092 18.2846 16.5336 18.418 16.4316 18.531C16.3296 18.644 16.2047 18.7326 16.0547 18.7966C15.9037 18.8596 15.7283 18.8923 15.5293 18.8923C15.3553 18.8923 15.1836 18.8634 15.0156 18.8064C14.8486 18.7494 14.6984 18.6525 14.5664 18.5115C14.4344 18.3725 14.3319 18.1859 14.2539 17.9529C14.1749 17.7199 14.1348 17.3751 14.1348 17.0271H12.2949C12.2949 17.6151 12.3704 18.1754 12.5234 18.5974C12.6764 19.0194 12.8817 19.3692 13.1367 19.6462C13.3907 19.9242 13.6827 20.136 14.0117 20.283C14.1967 20.366 14.3871 20.4283 14.5801 20.4783V22.0271H16.5781V20.4587C16.7561 20.4097 16.9279 20.3453 17.0879 20.2673C17.3999 20.1153 17.6648 19.9148 17.8848 19.6638C18.1058 19.4138 18.2774 19.1172 18.3984 18.7732C18.5174 18.4302 18.5781 18.0431 18.5781 17.6111C18.5781 17.1351 18.511 16.7228 18.377 16.3748C18.243 16.0268 18.0565 15.7217 17.8145 15.4587C17.5725 15.1967 17.2833 14.9634 16.9453 14.7634C16.6073 14.5614 16.2333 14.3646 15.8223 14.1736C15.5673 14.0556 15.3546 13.9418 15.1816 13.8318C15.0106 13.7218 14.8706 13.6033 14.7676 13.4783C14.6636 13.3533 14.5908 13.2181 14.5488 13.0701C14.5058 12.9231 14.4844 12.7599 14.4844 12.5779C14.4844 12.3969 14.5058 12.2271 14.5488 12.0701C14.5908 11.9131 14.6561 11.7749 14.7461 11.6599C14.8351 11.5449 14.9469 11.4544 15.0859 11.3884C15.2229 11.3224 15.3891 11.2888 15.5801 11.2888C15.9321 11.2888 16.2119 11.4343 16.4219 11.7263C16.6289 12.0143 16.7314 12.4521 16.7344 13.0291H18.5762C18.5742 12.5471 18.5192 12.1095 18.4082 11.7205C18.2962 11.3255 18.1357 10.9831 17.9277 10.6931C17.7207 10.4031 17.4669 10.169 17.1699 9.98804C16.9879 9.87404 16.7871 9.79327 16.5781 9.72827V8.0271H14.5781Z"
      fill="white"
    />
  </svg>
);

export interface ProgramPerformanceData {
  name: string;
  value: number;
}

const ProgramPerformancePage = () => {
  const [projectPerformance, setProjectPerformance] = useState<ProgramPerformanceData[]>([]);
  const [filteredProjects] = useAtom(filteredProjectsAtom);
  const [isBudgetOnly, setIsBudgetOnly] = useState(false);
  const [isScheduleOnly, setIsScheduleOnly] = useState(false);
  const [isBehindScheduleToggled, setIsBehindScheduleToggled] = useState(false);
  const [isOverBudgetToggled, setIsOverBudgetToggled] = useState(false);
  const [tableColumns, setTableColumns] = useState<any[]>([]);
  const [tableProjectData, setTableProjectData] = useState<ProjectDetail[]>([]);
  const [programPerformanceProjects, setMilestoneProjects] = useState<ProjectDetail[]>([]);
  const router = useRouter();

  const determineProjectPerformance = () => {
    const milestoneData: ProgramPerformanceData[] = [];

    if (isBudgetOnly) {
      milestoneData.push({ name: 'On Budget', value: 0 });
      milestoneData.push({ name: 'Over Budget', value: 0 });
    } else if (isScheduleOnly) {
      milestoneData.push({ name: 'On Schedule', value: 0 });
      milestoneData.push({ name: 'Behind Schedule', value: 0 });
    }
    const projectData = getTableProjectData();
    setTableProjectData(projectData);

    programPerformanceProjects.forEach((project) => {
      if (isScheduleOnly) {
        if (project.is_on_schedule) {
          milestoneData[0].value += 1;
        } else {
          milestoneData[1].value += 1;
        }
      }
      if (isBudgetOnly) {
        if (project.is_on_budget) {
          milestoneData[0].value += 1;
        } else {
          milestoneData[1].value += 1;
        }
      }
    });
    setProjectPerformance(milestoneData.filter((m) => m.value > 0));
  };

  useEffect(() => {
    const filteredPerformanceProjects = filteredProjects.filter(
      (project) => project.is_on_budget !== undefined && project.is_on_schedule !== undefined
    );

    setMilestoneProjects(filteredPerformanceProjects);
  }, [filteredProjects]);

  useEffect(() => {
    if (!isBudgetOnly && !isScheduleOnly) {
      const performance = [
        {
          name: 'On Schedule On Budget',
          value: programPerformanceProjects.filter(
            (project) => project.is_on_budget === true && project.is_on_schedule === true
          ).length,
        },
        {
          name: 'On Schedule Over Budget',
          value: programPerformanceProjects.filter(
            (project) => project.is_on_schedule === true && project.is_on_budget === false
          ).length,
        },
        {
          name: 'Behind Schedule On Budget',
          value: programPerformanceProjects.filter(
            (project) => project.is_on_schedule === false && project.is_on_budget === true
          ).length,
        },
        {
          name: 'Behind Schedule Over Budget',
          value: programPerformanceProjects.filter(
            (project) => project.is_on_schedule === false && project.is_on_budget === false
          ).length,
        },
      ];

      setProjectPerformance(performance.filter((m) => m.value > 0));

      setTableProjectData(getTableProjectData());
    } else {
      determineProjectPerformance();
    }
  }, [
    programPerformanceProjects,
    isBudgetOnly,
    isScheduleOnly,
    isBehindScheduleToggled,
    isOverBudgetToggled,
  ]);

  useEffect(() => {
    setTableProjectData(getTableProjectData());
  }, [isBehindScheduleToggled, isOverBudgetToggled, programPerformanceProjects]);

  const getTableProjectData = () => {
    if (!isBudgetOnly && !isScheduleOnly) {
      if (isBehindScheduleToggled && !isOverBudgetToggled) {
        return programPerformanceProjects.filter(
          (project) => project.is_on_schedule === false && project.is_on_budget === true
        );
      }
      if (!isBehindScheduleToggled && isOverBudgetToggled) {
        return programPerformanceProjects.filter(
          (project) => project.is_on_schedule === true && project.is_on_budget === false
        );
      }
      if (isBehindScheduleToggled && isOverBudgetToggled) {
        return programPerformanceProjects.filter(
          (project) => project.is_on_schedule === false && project.is_on_budget === false
        );
      }
      if (!isBehindScheduleToggled && !isOverBudgetToggled) {
        return programPerformanceProjects.filter(
          (project) => project.is_on_budget === true && project.is_on_schedule === true
        );
      }
    }

    if (isBudgetOnly) {
      if (isOverBudgetToggled) {
        return programPerformanceProjects.filter((project) => project.is_on_budget === false);
      }
      return programPerformanceProjects.filter((project) => project.is_on_budget === true);
    }

    if (isScheduleOnly) {
      if (isBehindScheduleToggled) {
        return programPerformanceProjects.filter((project) => project.is_on_schedule === false);
      }
      return programPerformanceProjects.filter((project) => project.is_on_schedule === true);
    }
    return [];
  };

  const handleProjectSelected = (projectId: number) => {
    const projectDetail = filteredProjects.find((p) => p.project_id === projectId) || null;

    if (projectDetail) {
      router.push(
        `${window.location.pathname}?projectId=${projectDetail.project_id}&cb=${Date.now()}`
      );
    }
  };

  const columns = [
    { accessor: 'project_id', title: 'Project ID', width: '78px' },
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
      accessor: 'is_on_schedule',
      title: (
        <div className={styles.headerIconContainer}>
          <div className={styles.headerIcon}>{clockIcon}</div>
          <div>Schedule Status</div>
        </div>
      ),
      width: '250px',
      render: (record: ProjectDetail) => (
        <div className={styles.iconTextContainer}>
          <div
            className={styles.headerIcon}
            style={{
              color: record.is_on_schedule ? 'var(--secondary-green)' : 'var(--secondary-red)',
              opacity: Number(record.schedule_status) === 2 ? 0.5 : 1,
            }}
          >
            {clockIcon}
          </div>
          <div>
            {record.is_on_schedule
              ? 'On Schedule'
              : Number(record.schedule_status) === 2
                ? '< 2 Months Behind Schedule'
                : '> 2 Months Behind Schedule'}
          </div>
        </div>
      ),
    },
    {
      accessor: 'is_on_budget',
      title: (
        <div className={styles.headerIconContainer}>
          <div className={styles.headerIcon}>{budgetIcon}</div>
          <div>Budget Status</div>
        </div>
      ),
      width: '200px',
      render: (record: ProjectDetail) => (
        <div className={styles.iconTextContainer}>
          <div
            className={styles.headerIcon}
            style={{
              color: record.is_on_budget ? 'var(--secondary-green)' : 'var(--secondary-red)',
              opacity: Number(record.budget_status) === 2 ? 0.5 : 1,
            }}
          >
            {budgetIcon}
          </div>
          <div>
            {record.is_on_budget
              ? 'On Budget'
              : Number(record.budget_status) === 2
                ? '5-10% Over Budget'
                : '> 10% Over Budget'}
          </div>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isBudgetOnly) {
      setTableColumns(columns.filter((col) => col.accessor !== 'is_on_schedule'));
    } else if (isScheduleOnly) {
      setTableColumns(columns.filter((col) => col.accessor !== 'is_on_budget'));
    } else {
      setTableColumns(columns);
    }
  }, [isBudgetOnly, isScheduleOnly]);

  useEffect(() => {
    setTableColumns(columns);
  }, []);

  return (
    <Layout>
      <div className={styles.milestonesContainer}>
        <div className={styles.chartContainer}>
          <ProgramPerformancePieChart
            milestones={projectPerformance}
            isBehindScheduleToggled={isBehindScheduleToggled}
            isOverBudgetToggled={isOverBudgetToggled}
            isBudgetOnly={isBudgetOnly}
            isScheduleOnly={isScheduleOnly}
          />
        </div>
        <div className={styles.tableContainer}>
          <div className={styles.scheduleBudgetTabs}>
            <UnstyledButton
              type="button"
              className={isScheduleOnly ? styles.scheduleBudgetTabActive : styles.scheduleBudgetTab}
              onClick={() => {
                setIsScheduleOnly(true);
                setIsBudgetOnly(false);
              }}
            >
              Schedule Status Only
            </UnstyledButton>
            <UnstyledButton
              type="button"
              className={isBudgetOnly ? styles.scheduleBudgetTabActive : styles.scheduleBudgetTab}
              onClick={() => {
                setIsBudgetOnly(true);
                setIsScheduleOnly(false);
              }}
            >
              Budget Status Only
            </UnstyledButton>
            <UnstyledButton
              type="button"
              className={
                !isScheduleOnly && !isBudgetOnly
                  ? styles.scheduleBudgetTabActive
                  : styles.scheduleBudgetTab
              }
              onClick={() => {
                setIsScheduleOnly(false);
                setIsBudgetOnly(false);
              }}
            >
              Schedule + Budget
            </UnstyledButton>
          </div>
          <div className={styles.scheduleBudgetTogglesContainer}>
            <div
              className={styles.scheduleBudgetToggle}
              style={{ display: isBudgetOnly ? 'none' : 'flex' }}
            >
              <span
                className={!isBehindScheduleToggled ? styles.greenToggleText : styles.inactiveText}
              >
                On Schedule
              </span>
              <UnstyledButton
                className={
                  !isBehindScheduleToggled ? styles.toggleIndicator : styles.toggleIndicatorToggled
                }
                onClick={() => setIsBehindScheduleToggled(!isBehindScheduleToggled)}
              >
                <img src="/project/clock.svg" alt="Schedule" className={styles.toggleIcon} />
              </UnstyledButton>
              <span
                className={isBehindScheduleToggled ? styles.redToggleText : styles.inactiveText}
              >
                Behind Schedule
              </span>
            </div>
            <div
              className={styles.scheduleBudgetToggle}
              style={{ display: isScheduleOnly ? 'none' : 'flex' }}
            >
              <span className={!isOverBudgetToggled ? styles.greenToggleText : styles.inactiveText}>
                On Budget
              </span>
              <UnstyledButton
                className={
                  !isOverBudgetToggled ? styles.toggleIndicator : styles.toggleIndicatorToggled
                }
                onClick={() => setIsOverBudgetToggled(!isOverBudgetToggled)}
              >
                <img src="/project/dollar.svg" alt="Budget" className={styles.toggleIcon} />
              </UnstyledButton>
              <span className={isOverBudgetToggled ? styles.redToggleText : styles.inactiveText}>
                Over Budget
              </span>
            </div>
          </div>
          <DataTable<ProjectDetail>
            id="milestoneTable"
            columns={tableColumns}
            records={tableProjectData}
            classNames={{ root: styles.table, header: styles.header }}
            rowClassName={styles.row}
          />
        </div>
      </div>
    </Layout>
  );
};

export default function WrappedProgramPerformancePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProgramPerformancePage />
    </Suspense>
  );
}
