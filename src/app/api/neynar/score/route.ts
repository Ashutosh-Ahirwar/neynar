import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fid = searchParams.get('fid');
  const apiKey = process.env.NEYNAR_API_KEY;

  if (!fid) {
    return NextResponse.json({ error: 'FID is required' }, { status: 400 });
  }

  if (!apiKey) {
    console.error("NEYNAR_API_KEY is not set in environment variables");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  try {
    const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`, {
      headers: {
        accept: 'application/json',
        api_key: apiKey
      },
      // Cache for 1 hour to save API credits and improve performance
      next: { revalidate: 3600 } 
    });

    if (!response.ok) {
      throw new Error(`Neynar API error: ${response.statusText}`);
    }

    const data = await response.json();
    const user = data.users?.[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return only what the frontend needs
    return NextResponse.json({
      score: user.score || 0, // Ensure we always return a number
      username: user.username,
      pfpUrl: user.pfp_url
    });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json({ error: 'Failed to fetch score' }, { status: 500 });
  }
}