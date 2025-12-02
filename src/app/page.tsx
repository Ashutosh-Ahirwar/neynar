import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

type Props = {
  searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const appUrl = "https://neynar-lyart.vercel.app";
  
  // 1. Check if we have share data in the URL
  const score = searchParams.score ? searchParams.score.toString() : null;
  const username = searchParams.user ? searchParams.user.toString() : null;

  // 2. Determine which image to show
  // If score exists -> Dynamic Image Generator
  // If not -> Static Hero Image
  const imageUrl = score && username
    ? `${appUrl}/api/og?score=${score}&user=${username}` 
    : `${appUrl}/hero.png`;

  const title = score 
    ? `Neynar Score: ${Number(score).toFixed(2)}` 
    : 'Check Neynar Score';

  // 3. Construct the Embed JSON
  const frame = {
    version: "1",
    imageUrl: imageUrl, 
    button: {
      title: "Check My Score",
      action: {
        type: "launch_frame",
        name: "Check Neynar Score",
        url: appUrl, // Always launch the app at the root (home)
        splashImageUrl: `${appUrl}/splash.png`,
        splashBackgroundColor: "#000000"
      }
    }
  };

  return {
    title: title,
    openGraph: {
      title: title,
      description: 'Check your Farcaster Reputation Score',
      images: [imageUrl],
    },
    other: {
      // The essential tag for Farcaster Mini Apps
      "fc:frame": JSON.stringify(frame)
    },
  };
}

export default function Home() {
  return (
    <MiniApp />
  );
}