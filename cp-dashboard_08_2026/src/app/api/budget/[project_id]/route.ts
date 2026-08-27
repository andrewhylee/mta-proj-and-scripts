import { getOpenDataData } from '../../ApiHelper';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ project_id: string }> }
) {
  const project_id = (await params).project_id;

  const response = await getOpenDataData(
    'f6fd-xfps.json',
    `?$query=SELECT%0A%20%20%60project_id%60%2C%0A%20%20%60acep%60%2C%0A%20%20%60task%60%2C%0A%20%20%60baseline_budget%60%2C%0A%20%20%60expenditures%60%2C%0A%20%20%60current_budget%60%2C%0A%20%20%60annotations%60%2C%0A%20%20%60update_date%60%0AWHERE%20%60project_id%60%20IN%20(%22${project_id}%22)%0AORDER%20BY%20%60update_date%60%20DESC%20NULL%20FIRST`
  );

  return response;
}
