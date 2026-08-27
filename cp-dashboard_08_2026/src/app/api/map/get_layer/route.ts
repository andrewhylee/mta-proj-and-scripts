import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { token, restOfUrl } = await req.json();

  const response = await fetch(
    `https://${process.env.ARCGIS_DOMAIN}/server/rest/services/Hosted/${restOfUrl}/query?token=${token}&where=1%3D1&outFields=*&f=json`
  );

  return NextResponse.json(await response.json());
}
