import { getOpenDataData } from '../../../ApiHelper';

export async function GET(_request: Request, { params }: { params: Promise<{ acep_id: string }> }) {
  const acep_id = (await params).acep_id;

  const response = await getOpenDataData(
    'f6fd-xfps.json',
    `?$query=SELECT%20%60project_id%60%20WHERE%20caseless_one_of(%60acep%60%2C%20%22${acep_id}%22)%0AGROUP%20BY%20%60project_id%60`
  );

  return response;
}
