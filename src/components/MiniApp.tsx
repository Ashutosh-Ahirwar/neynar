'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  Trophy, Share, Heart, Bookmark, Loader2, CheckCircle2, Search, X, Info
} from 'lucide-react';

// --- Types ---
interface UserContext {
  fid: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
}

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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}) => {
  const baseStyles = "w-full py-3 px-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 touch-manipulation";
  const variants = {
    primary: "bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-900/20",
    secondary: "bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm",
    outline: "border-2 border-purple-500/30 text-purple-300 hover:bg-purple-500/10",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5",
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

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-[#1c1c1e] rounded-2xl border border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-1"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  // Score is 0-1
  const offset = circumference - (score) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 0.9) return "text-green-500";
    if (s >= 0.7) return "text-purple-500";
    return "text-yellow-500";
  };

  return (
    <div className="relative flex items-center justify-center mb-6 animate-in zoom-in duration-500">
      <svg className="transform -rotate-90 w-48 h-48">
        <circle className="text-white/5" strokeWidth="12" stroke="currentColor" fill="transparent" r={radius} cx="96" cy="96" />
        <circle className={`${getColor(score)} transition-all duration-1000 ease-out`} strokeWidth="12" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" stroke="currentColor" fill="transparent" r={radius} cx="96" cy="96" />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white tracking-tighter">{score.toFixed(4)}</span>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-widest mt-1">Neynar Score</span>
      </div>
    </div>
  );
};

// --- Main Component ---
export default function MiniApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserContext | null>(null);
  
  const [score, setScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  
  const [isAdded, setIsAdded] = useState(false);
  const [donationStatus, setDonationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleAddApp = useCallback(async () => {
    try {
      await sdk.actions.addMiniApp();
      setIsAdded(true);
    } catch (e) {
      console.error("Failed to add miniapp:", e);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!user || score === null) return;
    const text = `My Neynar Score is ${score.toFixed(4)}! 🏆\n\nCheck yours in the Neynar Score Mini App.`;
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

  const handleCheckScore = async () => {
    if (!user) return;
    setIsLoadingScore(true);
    try {
      const response = await fetch(`https://api.neynar.com/v2/farcaster/user/bulk?fids=${user.fid}`, {
        headers: {
          accept: 'application/json',
          api_key: process.env.NEXT_PUBLIC_NEYNAR_API_KEY || 'NEYNAR_API_DOCS'
        }
      });
      const data = await response.json();
      
      if (data.users && data.users[0]) {
        const userScore = data.users[0].score || 0;
        setScore(userScore);
      }
    } catch (apiError) {
      console.error("Failed to fetch Neynar score:", apiError);
      setScore(0);
    } finally {
      setIsLoadingScore(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      sdk.actions.ready();
      
      try {
        const context = await sdk.context;
        
        if (context && context.user) {
          setUser({
            fid: context.user.fid,
            username: context.user.username,
            displayName: context.user.displayName,
            pfpUrl: context.user.pfpUrl
          });
          
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
            {!isAdded && <button onClick={handleAddApp} className="p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"><Bookmark size={20} /></button>}
            {user?.pfpUrl && <img src={user.pfpUrl} alt="Profile" className="w-9 h-9 rounded-full border border-white/10" />}
          </div>
        </header>

        <div className="flex-1 flex flex-col">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-1">Hello, {user?.displayName || 'User'}</h2>
            <p className="text-gray-400 text-sm">Check your current Neynar reputation score.</p>
          </div>

          {score === null ? (
            <div className="flex-1 flex flex-col items-center justify-center mb-8">
              <div className="w-20 h-20 bg-purple-500/10 rounded-full flex items-center justify-center mb-6">
                <Search className="text-purple-400" size={32} />
              </div>
              <Button 
                onClick={handleCheckScore} 
                disabled={isLoadingScore}
                className="max-w-[200px]"
              >
                {isLoadingScore ? (
                  <><Loader2 className="animate-spin" size={20} /> Loading...</>
                ) : (
                  'Check My Score'
                )}
              </Button>
            </div>
          ) : (
            <ScoreGauge score={score} />
          )}

          {score !== null && (
            <div className="space-y-3 mt-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
              <Button onClick={handleShare} icon={Share}>Share Score</Button>
              
              <Button 
                onClick={() => setShowInfoModal(true)} 
                variant="outline" 
                icon={Info}
              >
                How to improve score?
              </Button>
            </div>
          )}

          {/* Subtle Donate Footer */}
          <div className="mt-8 pt-4 border-t border-white/5 text-center">
             <button 
               onClick={handleDonate}
               disabled={donationStatus !== 'idle'}
               className="text-xs text-gray-600 hover:text-purple-400 transition-colors flex items-center justify-center gap-1.5 mx-auto"
             >
                {donationStatus === 'success' ? (
                  <CheckCircle2 size={12} className="text-green-500" />
                ) : (
                  <Heart size={12} />
                )}
                {donationStatus === 'pending' ? 'Processing...' : 
                 donationStatus === 'success' ? 'Thank You!' : 'Donate 0.0005 ETH (Base)'}
             </button>
          </div>
        </div>
      </main>

      {/* Info Modal */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-3 text-purple-400">
              <Trophy size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Neynar User Score</h3>
            <p className="text-gray-400 text-xs mt-1">A measure of account quality (0.0 - 1.0)</p>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div className="bg-white/5 p-3 rounded-lg border border-white/5">
              <h4 className="text-white font-semibold mb-1 text-xs uppercase tracking-wider">What is it?</h4>
              <p className="text-xs leading-relaxed">
                It reflects the confidence in a user being high-quality. It is <strong>not</strong> proof of humanity, but filters out spam and low-quality AI slop. Scores update weekly.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-2 text-xs uppercase tracking-wider">How to Improve?</h4>
              <ul className="space-y-3">
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">1.</span>
                  <span><strong>Authentic Content:</strong> Don't just cast "gm" or repost internet photos. Share original thoughts and personal stories.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">2.</span>
                  <span><strong>No Spam:</strong> Avoid only posting mini-apps or generic AI-generated replies.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">3.</span>
                  <span><strong>Quality Profile:</strong> Use a clear PFP, write a unique bio, and avoid random-number usernames.</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-purple-400 font-bold">4.</span>
                  <span><strong>Connect:</strong> Engage in real conversations. Don't just broadcast.</span>
                </li>
              </ul>
            </div>
          </div>

          <Button onClick={() => setShowInfoModal(false)} variant="secondary">
            Got it
          </Button>
        </div>
      </Modal>

    </div>
  );
}