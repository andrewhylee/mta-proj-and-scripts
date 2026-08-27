import dayjs from 'dayjs';
import { FC, JSX, useEffect, useState } from 'react';
import { Timeline as MantineTimeline, Text } from '@mantine/core';
import { ScheduleItem } from '@/data/Helpers/ScheduleData';
import styles from './Schedule.module.css';

interface ScheduleTimelineItem {
  phase: string;
  phase_state: string;
  phase_est_actual_start_date: string | undefined;
  phase_est_actual_end_date: string | undefined;
  delayed?: boolean;
  activities: ScheduleActivity[];
}

interface ScheduleActivity {
  activity_title: string;
  activity_date: string | undefined;
  activity_description: string | undefined;
  delayed?: boolean;
  url: string | undefined;
}

export const Schedule: FC<{ scheduleData: ScheduleItem[] }> = ({ scheduleData }): JSX.Element => {
  const [processedScheduleData, setProcessedScheduleData] = useState<ScheduleTimelineItem[]>([]);
  const [activeNode, setActiveNode] = useState(0);

  useEffect(() => {
    const data = processScheduleData(scheduleData);
    setProcessedScheduleData(data);
  }, [scheduleData]);

  const groupActivitiesByPhase = (data: ScheduleItem[]): Record<string, ScheduleTimelineItem> => {
    const groupedData: Record<string, ScheduleTimelineItem> = {};
    data.forEach((item) => {
      if (!groupedData[item.phase]) {
        groupedData[item.phase] = {
          phase: item.phase,
          phase_state: item.phase_state,
          delayed: item.activity_flag !== undefined && item.activity_flag !== '',
          phase_est_actual_start_date: item.phase_est_actual_start_date,
          phase_est_actual_end_date: item.phase_est_actual_end_date,
          activities: [],
        };
      }
      if (item.activity_title && item.activity_title?.length > 0) {
        if (item.delayed) {
          groupedData[item.phase].activities = groupedData[item.phase].activities.filter(
            (activity) => activity.delayed === false
          );
        }

        groupedData[item.phase].activities.push({
          activity_title: item.activity_title ?? '',
          activity_date: item.activity_date
            ? dayjs(item.activity_date).format("MMM 'YY")
            : undefined,
          activity_description: item.activity_description,
          delayed: item.delayed,
          url: item.url ? item.url.url : undefined,
        });

        if (item.delayed === true) {
          groupedData[item.phase].delayed = true; // Set delayed if any activity is delayed
        }
      }
    });

    return groupedData;
  };

  const formatScheduleDates = (data: ScheduleItem[]): ScheduleItem[] => {
    const processedData = data.map((item) => ({
      ...item,
      phase_est_actual_start_date: item.phase_est_actual_start_date
        ? dayjs(item.phase_est_actual_start_date).format("MMM 'YY")
        : undefined,
      phase_est_actual_end_date: item.phase_est_actual_end_date
        ? dayjs(item.phase_est_actual_end_date).format("MMM 'YY")
        : undefined,
    }));

    return processedData;
  };

  const processScheduleData = (data: ScheduleItem[]): ScheduleTimelineItem[] => {
    if (!data || data.length === 0) {
      return [];
    }
    //sort by phase_sequence
    data.sort((a, b) => {
      const aSequence = a.phase_sequence ? parseInt(a.phase_sequence, 10) : 0;
      const bSequence = b.phase_sequence ? parseInt(b.phase_sequence, 10) : 0;
      return aSequence - bSequence;
    });

    const processedData = formatScheduleDates(data);

    //loop through processedData and group by phase and create array of activities for each phase
    const groupedData = groupActivitiesByPhase(processedData);

    //loop through groupedData and find the active node
    let index = 1;
    Object.keys(groupedData).forEach((phase) => {
      const item = groupedData[phase];
      if (item.phase_state === 'Active') {
        setActiveNode(index);
      }
      index++;
    });

    return Object.values(groupedData);
  };

  return (
    <>
      <MantineTimeline active={activeNode - 1} bulletSize={24} lineWidth={2}>
        {processedScheduleData.map((item, index) => (
          <MantineTimeline.Item
            key={index}
            bullet={
              item.phase_state === 'Complete' ? (
                <img src="/project/check.svg" className={styles.scheduleItemBullet} alt="Bullet" />
              ) : item.phase_state === 'Pending' ? (
                <div className={styles.scheduleItemBulletPending} />
              ) : item.delayed === true ? (
                <div className={styles.scheduleItemBulletDelayed} />
              ) : null
            }
            title={item.phase}
            color="var(--secondary-green)"
            classNames={{
              itemTitle: styles.scheduleItemPhaseTitle,
              item: styles.scheduleItem,
            }}
          >
            {item.phase_est_actual_start_date && item.phase_est_actual_end_date && (
              <div className={styles.scheduleItemContent}>
                <div className={styles.scheduleItemDateRange}>
                  <span className={styles.scheduleItemDateLabel}>Start:&nbsp;</span>
                  <span className={styles.scheduleItemDateValue}>
                    {item.phase_est_actual_start_date}
                  </span>
                  &nbsp;
                  <span className={styles.scheduleItemDateLabel}>
                    End
                    {item.phase === 'Construction' && <span>(Current)</span>}:
                  </span>
                  &nbsp;
                  <span className={styles.scheduleItemDateValue}>
                    {item.phase_est_actual_end_date}
                  </span>
                </div>
                {item.activities.length > 0 ? (
                  item.activities.map((activity, activityIndex) => (
                    <div key={activityIndex} className={styles.scheduleItemActivity}>
                      <div>
                        <span
                          className={styles.scheduleItemActivityTitle}
                          style={{
                            color: activity.delayed ? 'var(--secondary-red)' : 'var(--blue-color)',
                          }}
                        >
                          {activity.url ? (
                            <a href={activity.url} target="_blank" rel="noopener noreferrer">
                              {activity.activity_title}
                            </a>
                          ) : (
                            activity.activity_title
                          )}
                          :{' '}
                        </span>
                        <span className={styles.scheduleItemActivityDate}>
                          {activity.activity_date ? activity.activity_date : 'No date available'}
                        </span>
                      </div>
                      <div className={styles.scheduleItemDescription}>
                        {activity.activity_description}
                      </div>
                    </div>
                  ))
                ) : (
                  <Text className={styles.scheduleItemDescription}>
                    No activities available for this phase.
                  </Text>
                )}
              </div>
            )}
          </MantineTimeline.Item>
        ))}
      </MantineTimeline>
    </>
  );
};
