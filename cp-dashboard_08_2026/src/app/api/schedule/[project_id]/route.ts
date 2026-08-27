import { getOpenDataData } from '../../ApiHelper';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const project_id = (await params).project_id;

  const response = await getOpenDataData(
    'nswv-d6bz.json',
    `?$query=SELECT%0A%20%20%60project_id%60%2C%0A%20%20%60phase%60%2C%0A%20%20%60phase_sequence%60%2C%0A%20%20%60phase_state%60%2C%0A%20%20%60phase_est_actual_start_date%60%2C%0A%20%20%60phase_est_actual_end_date%60%2C%0A%20%20%60activity_title%60%2C%0A%20%20%60activity_description%60%2C%0A%20%20%60activity_date%60%2C%0A%20%20%60activity_flag%60%2C%0A%20%20%60url%60%2C%0A%20%20%60update_date%60%0AWHERE%20%60project_id%60%20IN%20(%22${project_id}%22)`
  );

  return response;
}
