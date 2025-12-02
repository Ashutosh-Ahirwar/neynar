import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

// In Next.js 15, params is a Promise
type Props = {
  params: Promise<{ score: string; username: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // Await the params to get the values
  const { score, username } = await params;
  
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
  
  // Decode the username in case it has special characters
  const decodedUsername = decodeURIComponent(username);

  // Generate dynamic image URL using the OG API
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
        splashBackgroundColor: "#000000"
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