import { getOpenDataData } from '../../../ApiHelper';

export async function GET(_request: Request, { params }: { params: Promise<{ query: string }> }) {
  const query = (await params).query;

  const response = await getOpenDataData(
    '6kvv-fcph.json',
    `?$query=SELECT%20%60acep%60%2C%20%60title%60%0AWHERE%0A%20%20caseless_starts_with(%60acep%60%2C%20%22${query}%22)%20OR%20caseless_contains(%60title%60%2C%20%22${query}%22)`
  );

  return response;
}
//https://data.ny.gov/resource/6kvv-fcph.json?$query=SELECT%20%60acep%60%2C%20%60title%60%0AWHERE%0A%20%20caseless_starts_with(%60acep%60%2C%20%22${query}%22)%20OR%20caseless_contains(%60title%60%2C%20%22${query}%22)
