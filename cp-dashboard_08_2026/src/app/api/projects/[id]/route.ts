import { getOpenDataData } from '../../ApiHelper';

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id;

  const response = await getOpenDataData(
    '9hy6-8j6t.json',
    `?$query=SELECT%0A%20%20%60project_id%60%2C%0A%20%20%60title%60%2C%0A%20%20%60stage%60%2C%0A%20%20%60phase%60%2C%0A%20%20%60agencies%60%2C%0A%20%20%60asset_categories%60%2C%0A%20%20%60type%60%2C%0A%20%20%60description%60%2C%0A%20%20%60services%60%2C%0A%20%20%60capital_plans%60%2C%0A%20%20%60districts%60%2C%0A%20%20%60prime_contractor%60%2C%0A%20%20%60contract_number%60%2C%0A%20%20%60contract_type%60%2C%0A%20%20%60initiatives%60%2C%0A%20%20%60budget_status%60%2C%0A%20%20%60schedule_status%60%2C%0A%20%20%60start_date%60%2C%0A%20%20%60goal_completion_date%60%2C%0A%20%20%60estimated_actual_completion%60%2C%0A%20%20%60goal_project_cost%60%2C%0A%20%20%60estimated_actual_project%60%2C%0A%20%20%60search_tags%60%0AWHERE%20%60project_id%60%20IN%20(%22${id}%22)`
  );

  return response;
}
