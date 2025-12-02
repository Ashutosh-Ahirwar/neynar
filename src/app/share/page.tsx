import type { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

export const dynamic = 'force-dynamic';

type Props = {
  // Next.js 15 requires searchParams to be a Promise
  params: Promise<{ [key: string]: string }>; // Required even if empty
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  // 1. Await the searchParams
  const query = await searchParams;

  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://neynar-lyart.vercel.app';

  // 2. Extract Data
  const rawScore = query.score;
  const rawUsername = query.username || query.user;

  const scoreString = Array.isArray(rawScore) ? rawScore[0] : (rawScore || '0');
  const usernameString = Array.isArray(rawUsername) ? rawUsername[0] : (rawUsername || 'User');

  // 3. Normalize
  const numericScore = Number(scoreString);
  const normalizedScore = Number.isFinite(numericScore)
    ? numericScore.toFixed(2)
    : '0.00';

  const decodedUsername = decodeURIComponent(usernameString);

  // 4. Construct Image URL
  const imageUrl = `${appUrl}/api/og?score=${encodeURIComponent(
    normalizedScore
  )}&user=${encodeURIComponent(decodedUsername)}`;

  const title = `Neynar Score: ${normalizedScore}`;

  const frame = {
    version: '1',
    imageUrl,
    button: {
      title: 'Check My Score',
      action: {
        type: 'launch_frame',
        name: 'Check Neynar Score',
        url: appUrl,
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: '#000000',
      },
    },
  };

  const stringifiedFrame = JSON.stringify(frame);

  return {
    title,
    openGraph: {
      title,
      description: `Check @${decodedUsername}'s Farcaster Reputation Score`,
      images: [imageUrl],
    },
    other: {
      'fc:frame': stringifiedFrame,
      'fc:miniapp': stringifiedFrame,
    },
  };
}

export default function SharePage() {
  return <MiniApp />;
}