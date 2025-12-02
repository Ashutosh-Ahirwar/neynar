import { Metadata } from 'next';
import MiniApp from '@/components/MiniApp';

const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";

// Static Metadata for the main homepage
const frame = {
  version: "1",
  imageUrl: `${appUrl}/hero.png`,
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

export const metadata: Metadata = {
  title: "Check Neynar Score",
  description: "Check your Farcaster Reputation Score",
  openGraph: {
    title: "Check Neynar Score",
    description: "Check your Farcaster Reputation Score",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    "fc:frame": stringifiedFrame,
    "fc:miniapp": stringifiedFrame,
  },
};

export default function Home() {
  return (
    <MiniApp />
  );
}