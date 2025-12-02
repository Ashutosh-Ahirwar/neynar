import type { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

// Ensure this route is always rendered dynamically
export const dynamic = 'force-dynamic';

type Props = {
  // In Next.js 15, searchParams is a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { searchParams }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  // 1. Await the searchParams (Next.js 15 requirement)
  const query = await searchParams;

  const appUrl = process.env.NEXT_PUBLIC_URL || 'https://neynar-lyart.vercel.app';

  // 2. Extract and Validate Query Parameters
  // Handle cases where params might be arrays or undefined
  const rawScore = query.score;
  const rawUsername = query.username || query.user; // Support both 'username' and 'user'

  const scoreString = Array.isArray(rawScore) ? rawScore[0] : (rawScore || '0');
  const usernameString = Array.isArray(rawUsername) ? rawUsername[0] : (rawUsername || 'User');

  // 3. Normalize Data
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

  // 5. Build Embed JSON
  const frame = {
    version: '1',
    imageUrl,
    button: {
      title: 'Check My Score',
      action: {
        type: 'launch_frame',
        name: 'Check Neynar Score',
        url: appUrl, // Opens the main app when clicked
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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: `${decodedUsername}'s Neynar Score`,
        },
      ],
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