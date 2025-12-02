import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, 
};

// Default fallback metadata for the main home page
const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";

const frame = {
  version: "1",
  imageUrl: `${appUrl}/hero.png`, // Uses your hero.png route
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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app"),
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-black text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}