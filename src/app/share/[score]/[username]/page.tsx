import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

// CRITICAL: Forces this page to be dynamic so it can read params correctly
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ score: string; username: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { score, username } = await params;
  
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
  const decodedUsername = decodeURIComponent(username);
  const imageUrl = `${appUrl}/api/og?score=${score}&user=${encodeURIComponent(decodedUsername)}`;

  const title = `Neynar Score: ${Number(score).toFixed(2)}`;

  const frame = {
    version: "1",
    imageUrl: imageUrl, 
    button: {
      title: "Check My Score",
      action: {
        type: "launch_frame",
        name: "Check Neynar Score",
        url: appUrl, 
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#ffffff"
      }
    }
  };

  const stringifiedFrame = JSON.stringify(frame);

  return {
    title: title,
    openGraph: {
      title: title,
      description: `Check @${decodedUsername}'s Farcaster Reputation Score`,
      images: [imageUrl],
    },
    other: {
      "fc:frame": stringifiedFrame,
      "fc:miniapp": stringifiedFrame,
    },
  };
}

export default function SharePage() {
  return <MiniApp />;
}