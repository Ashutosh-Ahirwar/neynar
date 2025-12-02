import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

// Force dynamic rendering to handle params correctly
export const dynamic = 'force-dynamic';

type Props = {
  params: Promise<{ score: string; username: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { score, username } = await params;
  
  // Debug log (check Vercel logs)
  console.log(`Generating metadata for: ${username}, score: ${score}`);

  const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
  const decodedUsername = decodeURIComponent(username);
  
  // Construct image URL
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