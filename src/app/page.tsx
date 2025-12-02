import { Metadata, ResolvingMetadata } from 'next';
import MiniApp from '@/components/MiniApp';

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
  
  // Extract Data
  const score = query.score as string | undefined;
  const username = (query.username || query.user) as string | undefined;
  const pfp = query.pfp as string | undefined;
  
  const hasScore = !!score;

  // 2. DYNAMIC IMAGE LOGIC
  // If score exists -> Generate Dynamic Card (Score + User + PFP)
  // If NO score -> Show Static Hero Image
  const imageUrl = hasScore 
    ? `${APP_URL}/api/og?score=${score}&user=${encodeURIComponent(username || 'User')}&pfp=${encodeURIComponent(pfp || '')}`
    : `${APP_URL}/hero.png`; 

  // 3. DYNAMIC TEXT
  const title = hasScore 
    ? `Neynar Score: ${Number(score).toFixed(2)}`
    : "Check Your Neynar Score";

  const description = hasScore
    ? `Check @${username}'s Farcaster Reputation Score`
    : "Discover your reputation score on Farcaster. Are you a top-tier user?";

  const buttonTitle = hasScore 
    ? "Check My Score" 
    : "Get Your Score";

  // 4. EMBED JSON
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
      description: description,
      images: [imageUrl],
    },
    other: {
      "fc:frame": frameMetadata,
      "fc:miniapp": frameMetadata,
    },
  };
}

// 5. RENDER CLIENT COMPONENT
export default function Page() {
  return <MiniApp />;
}