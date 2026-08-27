import { NextResponse } from 'next/server';
import axios from 'axios';

export const OPEN_DATA_API_URL = 'https://data.ny.gov/resource/';

export async function getOpenDataData(resource: string, queryString: string): Promise<any> {
  try {
    const username = process.env.OPENDATA_USERNAME;
    const password = process.env.OPENDATA_PASSWORD;

    if (!username || !password) {
      return NextResponse.json({ error: 'No credentials provided' }, { status: 403 });
    }

    const response = await axios.get(`${OPEN_DATA_API_URL}${resource}${queryString}`, {
      auth: {
        username,
        password,
      },
    });

    return NextResponse.json(response.data || [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
