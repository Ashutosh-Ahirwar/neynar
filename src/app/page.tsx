import { Metadata } from 'next';
import MiniApp from '@/components/MiniApp';

// Define the Mini App Embed Metadata
const appUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

const frame = {
  version: "next",
  imageUrl: `${appUrl}/opengraph-image.png`,
  button: {
    title: "Check Score",
    action: {
      type: "launch_frame",
      name: "Neynar Score",
      url: appUrl,
      splashImageUrl: `${appUrl}/splash.png`,
      splashBackgroundColor: "#000000"
    }
  }
};

export const metadata: Metadata = {
  title: 'Neynar Score Mini App',
  description: 'Check your Farcaster Reputation Score',
  openGraph: {
    title: 'Neynar Score Mini App',
    description: 'Check your Farcaster Reputation Score',
  },
  other: {
    "fc:frame": JSON.stringify(frame)
  },
};

export default function Home() {
  return (
    <MiniApp />
  );
}