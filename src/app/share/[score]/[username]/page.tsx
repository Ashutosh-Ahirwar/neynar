import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

type Props = {
  params: { score: string; username: string }
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
  
  const score = params.score;
  const username = params.username;

  // Generate dynamic image URL using the existing OG API
  const imageUrl = `${appUrl}/api/og?score=${score}&user=${username}`;

  const title = `Neynar Score: ${Number(score).toFixed(2)}`;

  const frame = {
    version: "1",
    imageUrl: imageUrl, 
    button: {
      title: "Check My Score",
      action: {
        type: "launch_frame",
        name: "Check Neynar Score",
        url: appUrl, // Launch the app at root to check viewer's own score
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };

  const stringifiedFrame = JSON.stringify(frame);

  return {
    title: title,
    openGraph: {
      title: title,
      description: `Check @${username}'s Farcaster Reputation Score`,
      images: [imageUrl],
    },
    other: {
      "fc:frame": stringifiedFrame,
      "fc:miniapp": stringifiedFrame,
    },
  };
}

export default function SharePage() {
  // Render the same MiniApp component
  return <MiniApp />;
}