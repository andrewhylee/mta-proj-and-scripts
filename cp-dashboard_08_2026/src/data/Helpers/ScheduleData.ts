import dayjs from 'dayjs';
import axios from 'axios';

export interface ScheduleItem {
  project_id: number;
  phase: string;
  phase_sequence: string;
  phase_state: string;
  phase_est_actual_start_date?: string;
  phase_est_actual_end_date?: string;
  activity_title?: string;
  activity_description?: string;
  activity_date?: string;
  activity_flag?: string;
  url?: { url: string };
  update_date: string;
  delayed?: boolean; // Indicates if the activity is delayed
}

export const getScheduleDataForProject = async (project_id: number): Promise<ScheduleItem[]> => {
  const response = await axios.get(`/api/schedule/${project_id}`);

  const items = response.data as ScheduleItem[];

  return items.map((item) => ({
    ...item,
    delayed: item.activity_flag !== undefined && item.activity_flag !== '',
    update_date: dayjs(item.update_date).format('YYYY-MM'),
  }));
};
