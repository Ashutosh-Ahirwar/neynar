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
  
  // Ensure we have a valid URL base
  const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
  
  const decodedUsername = decodeURIComponent(username);
  
  // Construct image URL for the OG image
  // We use the absolute URL for the image
  const imageUrl = `${appUrl}/api/og?score=${score}&user=${encodeURIComponent(decodedUsername)}`;

  const title = `Neynar Score: ${Number(score).toFixed(2)}`;

  // Construct the Frame/MiniApp metadata
  const frame = {
    version: "1",
    imageUrl: imageUrl, 
    button: {
      title: "Check My Score",
      action: {
        type: "launch_frame",
        name: "Check Neynar Score",
        url: appUrl, // This is the URL the app will open to (the home page)
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
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 800,
          alt: `${decodedUsername}'s Neynar Score`,
        }
      ],
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