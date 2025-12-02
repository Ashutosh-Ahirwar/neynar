'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  Trophy, Share, Heart, Bookmark, X, Loader2, CheckCircle2
} from 'lucide-react';

// --- Types ---
interface UserContext {
  fid: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
}

// --- Mock Data Helpers ---
const getMockNeynarScore = (fid: number) => {
  const hash = fid * 1337;
  const score = (hash % 35) + 65; 
  return score + ((hash % 10) / 10);
};

// --- Sub-Components ---
const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  icon: Icon
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation";
  const variants = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
    outline: "border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10",
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={20} />}
      {children}
    </button>
  );
};

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 90) return "text-green-500";
    if (s >= 80) return "text-purple-500";
    return "text-yellow-500";
  };

  return (
    <div className="relative flex items-center justify-center mb-8">
      <svg className="transform -rotate-90 w-48 h-48">
        <circle className="text-white/5" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="96" cy="96" />
        <circle className={`${getColor(score)} transition-all duration-1000 ease-out`} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="96" cy="96" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white tracking-tighter">{score.toFixed(1)}%</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Quality Score</span>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function MiniApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserContext | null>(null);
  const [score, setScore] = useState<number>(0);
  const [isAdded, setIsAdded] = useState(false);
  const [donationStatus, setDonationStatus] = useState<'idle' | 'pending' | 'success'>('idle');

  const handleAddApp = useCallback(async () => {
    try {
      await sdk.actions.addMiniApp();
      setIsAdded(true);
    } catch (e) {
      console.error("Failed to add miniapp:", e);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!user) return;
    const text = `My Neynar Quality Score is ${score.toFixed(1)}%! 🏆\n\nCheck your score in the Neynar Score Mini App.`;
    const embedUrl = "https://neynar-score-miniapp.vercel.app"; 
    
    try {
      await sdk.actions.composeCast({ text: text, embeds: [embedUrl] });
    } catch (e) {
      console.error("Failed to share:", e);
    }
  }, [score, user]);

  const handleDonate = useCallback(async () => {
    try {
      setDonationStatus('pending');
      await sdk.actions.sendToken({
        token: "eip155:8453/native", 
        amount: "500000000000000", // 0.0005 ETH in Wei
        recipientAddress: "0xa6DEe9FdE9E1203ad02228f00bF10235d9Ca3752"
      });
      setDonationStatus('success');
      setTimeout(() => setDonationStatus('idle'), 3000);
    } catch (e) {
      console.error("Donation failed:", e);
      setDonationStatus('idle');
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      // 1. Notify Farcaster the app is ready
      sdk.actions.ready();
      
      try {
        // 2. Await the context. This fixes the TS error because
        // it resolves the Promise<MiniAppContext> into MiniAppContext.
        const context = await sdk.context;
        
        if (context && context.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl
          });
          setScore(getMockNeynarScore(context.user.fid));
          
          if (context.client && context.client.added) {
            setIsAdded(true);
          }
        }
      } catch (error) {
        console.error("Error loading context:", error);
      } finally {
        setIsLoaded(true);
      }
    };
    init();
  }, []);

  if (!isLoaded) {
    return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-purple-500" size={48} /></div>;
  }

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans">
      <div className="fixed inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black pointer-events-none" />
      <main className="relative max-w-md mx-auto p-6 flex flex-col min-h-screen">
        
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-orange-400 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">Neynar Score</h1>
              <p className="text-xs text-gray-500 font-medium">Mini App</p>
            </div>
          </div>
          <div className="flex gap-2">
            {!isAdded && <button onClick={handleAddApp} className="p-2 bg-white/5 rounded-full"><Bookmark size={20} /></button>}
            {user?.pfpUrl && <img src={user.pfpUrl} alt="Profile" className="w-9 h-9 rounded-full border border-white/10" />}
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Hello, {user?.displayName || 'User'}</h2>
            <p className="text-gray-400 text-sm">Your Farcaster reputation score is ready.</p>
          </div>

          <ScoreGauge score={score} />

          <div className="space-y-3 mt-auto">
            <Button onClick={handleShare} icon={Share}>Share Score</Button>
            <div className="grid grid-cols-2 gap-3">
              <Button onClick={handleDonate} variant="secondary" icon={donationStatus === 'success' ? CheckCircle2 : Heart}>
                {donationStatus === 'pending' ? '...' : donationStatus === 'success' ? 'Sent!' : 'Donate'}
              </Button>
              <Button onClick={handleAddApp} variant="outline" icon={Bookmark} disabled={isAdded}>
                {isAdded ? 'Saved' : 'Bookmark'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}