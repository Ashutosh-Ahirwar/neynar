import type { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

// Ensure this route is always rendered dynamically
export const dynamic = 'force-dynamic';

type SharePageParams = {
  score: string;
  username: string;
};

type Props = {
  params: SharePageParams;
};

export async function generateMetadata(
  { params }: Props,
  _parent: ResolvingMetadata
): Promise<Metadata> {
  const { score, username } = params;

  const appUrl =
    process.env.NEXT_PUBLIC_URL || 'https://neynar-lyart.vercel.app';

  const decodedUsername = decodeURIComponent(username);

  // Normalize score so the title + image URL are always consistent
  const numericScore = Number(score);
  const normalizedScore = Number.isFinite(numericScore)
    ? numericScore.toFixed(2)
    : '0.00';

  // This hits your existing /api/og endpoint
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
        url: appUrl, // Opens your home miniapp URL
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
      // Both for compatibility; clients usually read one of these
      'fc:frame': stringifiedFrame,
      'fc:miniapp': stringifiedFrame,
    },
  };
}

export default function SharePage() {
  // ✅ UI / functionality unchanged
  return <MiniApp />;
}
