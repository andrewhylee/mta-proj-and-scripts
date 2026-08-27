import { getOpenDataData } from '../../ApiHelper';

export async function GET(_request: Request, { params }: { params: Promise<{ acep_id: string }> }) {
  const acep_id = (await params).acep_id;

  const response = await getOpenDataData(
    '6kvv-fcph.json',
    `?$query=SELECT%0A%20%20%60acep%60%2C%0A%20%20%60agency%60%2C%0A%20%20%60agency_description%60%2C%0A%20%20%60plan_id%60%2C%0A%20%20%60category%60%2C%0A%20%20%60category_description%60%2C%0A%20%20%60element%60%2C%0A%20%20%60element_description%60%2C%0A%20%20%60needs_code%60%2C%0A%20%20%60project%60%2C%0A%20%20%60title%60%2C%0A%20%20%60description%60%2C%0A%20%20%60plan_revision%60%2C%0A%20%20%60date%60%2C%0A%20%20%60change_nar%60%2C%0A%20%20%60year_1_allocation%60%2C%0A%20%20%60year_2_allocation%60%2C%0A%20%20%60year_3_allocation%60%2C%0A%20%20%60year_4_allocation%60%2C%0A%20%20%60year_5_allocation%60%2C%0A%20%20%60out_years_allocation%60%2C%0A%20%20%60total_allocation%60%0AWHERE%20caseless_one_of(%60acep%60%2C%20%22${acep_id}%22)%0AORDER%20BY%20%60date%60%20ASC%20NULL%20LAST`
  );

  return response;
}
