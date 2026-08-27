'use client';

import React, { useEffect, useState } from 'react';
import { LoadingOverlay } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import ShareLink from '@/components/Common/ShareLink';
import MapComponent from '@/components/Map/Map';
import { Schedule } from '@/components/Project/Modal/Schedule/Schedule';
import { BudgetItem, getBudgetDataForProject } from '@/data/Helpers/BudgetData';
import { ProjectDetail } from '@/data/Helpers/ProjectData';
import { getScheduleDataForProject, ScheduleItem } from '@/data/Helpers/ScheduleData';
import AcepGrid from './Budget/AcepGrid';
import AcepPieChart from './Budget/AcepPieChart';
import BudgetChart, { BudgetChartData } from './Budget/BudgetChart';
import styles from './ProjectContent.module.css';

export interface ProjectContentProps {
  project?: ProjectDetail;
}

const ProjectContent: React.FC<ProjectContentProps> = ({ project }) => {
  const [budgetData, setBudgetData] = useState<BudgetItem[]>([]);
  const [aceps, setAceps] = useState<string[]>([]);
  const [focusedAcep, setFocusedAcep] = useState<string | undefined>(undefined);
  const [scheduleData, setScheduleData] = useState<ScheduleItem[]>([]);
  const [acepBudgetData, setAcepBudgetData] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [reducedBudgetData, setReducedBudgetData] = useState<BudgetChartData[]>([]);

  const isMobile = useMediaQuery('(max-width: 600px)');

  const fetchAndCacheScheduleData = async (cacheKey: string) => {
    const scheduleItems = (await getScheduleDataForProject(project!.project_id)) || [];
    sessionStorage.setItem(cacheKey, JSON.stringify(scheduleItems));
    return scheduleItems;
  };

  const fetchScheduleData = async () => {
    let scheduleItems: ScheduleItem[] = [];
    const cacheKey = `scheduleData_${project?.project_id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        scheduleItems = JSON.parse(cached);
      } catch {
        scheduleItems = await fetchAndCacheScheduleData(cacheKey);
      }
    } else {
      scheduleItems = await fetchAndCacheScheduleData(cacheKey);
    }
    setScheduleData(scheduleItems);
  };

  const fetchAndCacheBudgetData = async (cacheKey: string) => {
    const budgetItems = (await getBudgetDataForProject(project!.project_id)) || [];
    sessionStorage.setItem(cacheKey, JSON.stringify(budgetItems));
    return budgetItems;
  };

  const fetchBudgetData = async () => {
    let budgetItems: BudgetItem[] = [];
    const cacheKey = `budgetData_${project?.project_id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        budgetItems = JSON.parse(cached);
      } catch {
        budgetItems = await fetchAndCacheBudgetData(cacheKey);
      }
    } else {
      budgetItems = await fetchAndCacheBudgetData(cacheKey);
    }
    setBudgetData(budgetItems || []);

    const budgetByAcep: Record<string, number> = {};

    budgetItems.forEach((item) => {
      if (item.acep && item.current_budget) {
        budgetByAcep[item.acep] = (budgetByAcep[item.acep] || 0) + Number(item.current_budget);
      }
    });

    setAcepBudgetData(budgetByAcep);

    const uniqueAceps = Object.keys(budgetByAcep).sort((a, b) => {
      return (budgetByAcep[b] || 0) - (budgetByAcep[a] || 0);
    });

    setAceps(uniqueAceps);
  };

  const reduceBudgetData = (data: BudgetItem[]) => {
    return data.reduce((acc, item) => {
      const existing = acc.find((i) => String(i.update_date) === String(item.update_date));
      if (existing) {
        existing.current_budget += Number(item.current_budget);
        existing.baseline_budget += Number(item.baseline_budget);
        existing.eac += Number(item.eac);
        existing.expenditures += Number(item.expenditures);
      } else {
        acc.push({
          task: item.task,
          current_budget: Number(item.current_budget),
          baseline_budget: Number(item.baseline_budget),
          eac: Number(item.eac),
          expenditures: Number(item.expenditures),
          update_date: item.update_date,
        });
      }
      return acc;
    }, [] as BudgetChartData[]);
  };

  useEffect(() => {
    if (!project?.project_id) {
      return;
    }
    setLoading(true);
    const dataFetches = [];
    if (project.estimated_actual_project_cost) {
      dataFetches.push(fetchBudgetData());
    }
    if (project.estimated_actual_completion_date || project.phase === 'Active Procurement') {
      dataFetches.push(fetchScheduleData());
    }
    Promise.all(dataFetches).finally(() => setLoading(false));
  }, [project]);

  const togglePieSlice = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>, isHover: boolean, acep: string) => {
      (event.target as HTMLButtonElement).style.backgroundColor = isHover ? '#002164' : '#ffff';
      (event.target as HTMLButtonElement).style.color = isHover ? '#ffff' : '#002164';
      (event.target as HTMLButtonElement).style.cursor = isHover ? 'pointer' : 'default';
      setFocusedAcep(isHover ? acep : undefined);
    },
    []
  );

  useEffect(() => {
    if (budgetData.length > 0) {
      const newReducedBudgetData = reduceBudgetData(budgetData);
      setReducedBudgetData(newReducedBudgetData);
    }
  }, [budgetData]);

  return (
    <>
      <LoadingOverlay
        visible={loading}
        zIndex={1000}
        overlayProps={{ radius: 'sm', blur: 2 }}
        loaderProps={{ color: 'var(--blue-color)', type: 'bars' }}
      />
      {!project?.project_id && (
        <div style={{ textAlign: 'center' }}>
          <h1>404 - Project Not Found</h1>
          <p>Sorry, the project you are looking for was not found.</p>
        </div>
      )}
      {project?.project_id && (
        <div className={styles.modalContent}>
          <div className={styles.modalContentHeader}>
            <div className={styles.modalContentHeaderLine}>
              <div className={styles.modalContentHeaderTitle}>{project.title}</div>
              <ShareLink />
            </div>
            <div className={styles.modalContentHeaderDescriptionContainer}>
              <div className={styles.modalContentHeaderDescription}>
                {project.description}
                <div className={styles.initiativesContainer}>
                  {project.initiatives.map((initiative, index) => (
                    <div key={index} className={styles.initiativeTag}>
                      {initiative}
                    </div>
                  ))}
                </div>
              </div>
              <div className={styles.projectDetailsContainer}>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Project ID: </div>
                  <div className={styles.projectDetailText}>{project.project_id}</div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Agencies: </div>
                  <div className={styles.projectDetailText}>{project.agencies.join(', ')}</div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Asset Categories: </div>
                  <div className={styles.projectDetailText}>
                    {project.asset_categories.join(', ')}
                  </div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Status: </div>
                  <div
                    className={styles.projectDetailText}
                    style={{
                      color: ['Planned', 'Recently Awarded'].includes(project.phase)
                        ? 'green'
                        : undefined,
                    }}
                  >
                    {project.phase}
                  </div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Contract Number: </div>
                  <div className={styles.projectDetailText}>{project.contract_number}</div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Prime Contractor: </div>
                  <div className={styles.projectDetailText}>{project.prime_contractor}</div>
                </div>
                <div className={styles.agenciesContainer}>
                  <div className={styles.modalContentHeaderText}>Contract Type: </div>
                  <div className={styles.projectDetailText}>{project.contract_type}</div>
                </div>
              </div>
            </div>
          </div>
          <div className={styles.contentContainer}>
            {project.phase === 'Planned' && (
              <div className={styles.plannedPhaseMessage}>
                While we have committed to the work described at the candidate location(s) depicted,
                this work is still in the planning stage. As such, the Project ID is a placeholder,
                and the representation of constituent candidate locations may appear differently in
                the future as scopes are further solidified and work across assets or locations are
                bundled into formal projects.
              </div>
            )}
            {project.phase === 'Recently Awarded' && (
              <div className={styles.plannedPhaseMessage}>
                A third-party construction contract for this project has been awarded in the time
                since the Dashboard’s last quarterly update. As such, the project's total budget is
                being finalized and will appear in the next quarterly update.
              </div>
            )}
            <div className={styles.modalContentHeaderText}>Project Locations</div>
            <div className={styles.mapContainer}>
              <MapComponent isVisible projects={[project.project_id]} />
            </div>
          </div>
          <div className={styles.budgetScheduleContainer}>
            {budgetData.length > 0 && (
              <div className={styles.budgetContainer}>
                <div className={styles.budgetContainerHeader}>
                  <div className={styles.scheduleBudgetHeaderLeft}>
                    <img src="/project/dollar.svg" alt="Dollar Currency" />
                    Budget
                  </div>
                  {/* <div
                    className={styles.budgetScheduleHeaderIndicator}
                    style={{
                      background: project.is_on_budget
                        ? 'var(--secondary-green)'
                        : 'var(--secondary-red)',
                    }}
                  >
                    <img src="/project/dollar.svg" alt="Dollar Currency" />
                    {project.is_on_budget ? 'On Budget' : 'Over Budget'}
                  </div> */}
                </div>
                <div className={styles.budgetContent}>
                  <div className={styles.acepContainer}>
                    <div className={styles.acepTitle}>ACEPs: </div>
                    <div className={styles.acepGrid}>
                      <AcepGrid
                        aceps={aceps.slice(0, isMobile ? 2 : 4)}
                        isMobile={isMobile ?? false}
                        togglePieSlice={togglePieSlice}
                        budgetData={Object.entries(acepBudgetData).map(
                          ([acep, current_budget]) => ({
                            acep,
                            current_budget,
                          })
                        )}
                      />
                      {aceps.length > (isMobile ? 2 : 4) && (
                        <div className={styles.acepAdditionalContainer}>
                          <details>
                            <summary className={styles.acepAdditionalTitle}>
                              Additional ACEPs
                            </summary>
                            <AcepGrid
                              aceps={aceps.slice(isMobile ? 2 : 4)}
                              isMobile={isMobile ?? false}
                              togglePieSlice={togglePieSlice}
                              budgetData={Object.entries(acepBudgetData).map(
                                ([acep, current_budget]) => ({
                                  acep,
                                  current_budget,
                                })
                              )}
                            />
                          </details>
                        </div>
                      )}
                    </div>

                    <div className={styles.acepPieChartContainer}>
                      <AcepPieChart
                        aceps={aceps}
                        budgetData={Object.entries(acepBudgetData).map(
                          ([acep, current_budget]) => ({
                            acep,
                            current_budget,
                          })
                        )}
                        focusedAcep={focusedAcep}
                      />
                    </div>
                  </div>
                  <BudgetChart items={reducedBudgetData} />
                </div>
              </div>
            )}
            {scheduleData.length > 0 && (
              <div className={styles.scheduleContainer}>
                <div className={styles.budgetContainerHeader}>
                  <div className={styles.scheduleBudgetHeaderLeft}>
                    <img src="/project/clock.svg" alt="Schedule" />
                    Timeline
                  </div>
                  {/* <div
                    className={styles.budgetScheduleHeaderIndicator}
                    style={{
                      background: project.is_on_schedule
                        ? 'var(--secondary-green)'
                        : 'var(--secondary-red)',
                    }}
                  >
                    <img src="/project/clock.svg" alt="Schedule" />
                    {project.is_on_schedule ? 'On Schedule' : 'Behind Schedule'}
                  </div> */}
                </div>
                <div className={styles.scheduleContent}>
                  <Schedule scheduleData={scheduleData} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default ProjectContent;
