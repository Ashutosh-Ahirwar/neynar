import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp'; // Import the client component

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

// 1. GENERATE METADATA (Server-Side)
export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const query = await searchParams;
  
  // Check if we have a score in the URL (e.g. /?score=95&user=alice)
  const score = query.score as string;
  const username = (query.username || query.user) as string;
  const hasScore = !!score;

  // Dynamic Image URL
  const imageUrl = hasScore 
    ? `${APP_URL}/api/og?score=${score}&user=${username}`
    : `${APP_URL}/api/og`; // Default/Hero image

  // Dynamic Text
  const title = hasScore 
    ? `Neynar Score: ${Number(score).toFixed(2)}`
    : "Check Your Neynar Score";

  const buttonTitle = hasScore 
    ? "Check My Score" 
    : "Get Your Score";

  // Define the Embed (Frame/MiniApp)
  const frameMetadata = JSON.stringify({
    version: "1",
    imageUrl: imageUrl,
    button: {
      title: buttonTitle,
      action: {
        type: "launch_frame",
        name: "Neynar Score",
        url: APP_URL,
        splashImageUrl: `${APP_URL}/splash.png`,
        splashBackgroundColor: "#000000",
      },
    },
  });

  return {
    title: title,
    openGraph: {
      title: title,
      description: "Check your Farcaster reputation score on Neynar.",
      images: [imageUrl],
    },
    other: {
      "fc:frame": frameMetadata,
      "fc:miniapp": frameMetadata,
    },
  };
}

// 2. RENDER CLIENT COMPONENT
export default function Page() {
  return <MiniApp />;
}