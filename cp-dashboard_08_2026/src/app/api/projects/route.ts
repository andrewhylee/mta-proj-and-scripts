import { getOpenDataData } from '../ApiHelper';

export async function GET(_request: Request) {
  const response = await getOpenDataData('9hy6-8j6t.json', ``);

  return response;
}
