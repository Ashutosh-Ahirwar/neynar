import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // Prevents zooming in the Farcaster mobile browser
};

// Default fallback metadata
const appUrl = "https://neynar-lyart.vercel.app";
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
      splashBackgroundColor: "#ffffff"
    }
  }
};

export const metadata: Metadata = {
  title: "Check Neynar Score",
  description: "Check your Farcaster Reputation Score",
  openGraph: {
    title: "Check Neynar Score",
    description: "Check your Farcaster Reputation Score",
    images: [`${appUrl}/hero.png`],
  },
  other: {
    "fc:frame": JSON.stringify(frame),
    "fc:miniapp": JSON.stringify(frame), // Adding the new standard tag as well
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