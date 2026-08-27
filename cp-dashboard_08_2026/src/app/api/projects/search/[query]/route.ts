import { getOpenDataData } from '../../../ApiHelper';

export async function GET(_request: Request, { params }: { params: Promise<{ query: string }> }) {
  const query = (await params).query;

  const sanitizedQuery = isNaN(Number(query)) ? '0' : query;

  const response = await getOpenDataData(
    '9hy6-8j6t.json',
    `?$query=SELECT%20%60project_id%60%2C%20%60title%60%0AWHERE%20%60project_id%60%20IN%20(%22${sanitizedQuery}%22)%20OR%20caseless_contains(%60title%60%2C%20%22${query}%22)`
  );

  return response;
}
