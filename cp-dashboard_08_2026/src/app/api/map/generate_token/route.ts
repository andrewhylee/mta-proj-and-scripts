import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const clientId = process.env.ARCGIS_CLIENT_ID;
    const clientSecret = process.env.ARCGIS_SECRET;

    // Replace with your actual token endpoint and request body
    const response = await fetch(
      `https://${process.env.ARCGIS_DOMAIN}/portal/sharing/rest/oauth2/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'client_credentials', // Or other grant type
          client_id: clientId ?? '',
          client_secret: clientSecret ?? '',
        }).toString(),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.error_description || 'Token generation failed' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json({ token: data.access_token });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
