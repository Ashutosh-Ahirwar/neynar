'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  Trophy, Share, Heart, Bookmark, Loader2, CheckCircle2, Search, X, Info, ChevronRight, ShieldCheck, UserCheck, MessageCircle, Sparkles
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
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  className?: string;
  disabled?: boolean;
  icon?: React.ElementType;
}) => {
  const baseStyles = "w-full py-3.5 px-6 rounded-2xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 active:scale-95 touch-manipulation shadow-sm";
  const variants = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/25 border border-white/10",
    secondary: "bg-white/5 text-white hover:bg-white/10 backdrop-blur-md border border-white/5",
    outline: "border border-white/20 text-gray-300 hover:bg-white/5 hover:text-white hover:border-white/40",
    ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-white/5 shadow-none",
    glass: "bg-black/40 backdrop-blur-xl border border-white/10 text-white hover:bg-white/10"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {Icon && <Icon size={18} />}
      {children}
    </button>
  );
};

const Modal = ({ isOpen, onClose, children }: { isOpen: boolean; onClose: () => void; children: React.ReactNode }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-sm bg-[#151516] rounded-3xl border border-white/10 shadow-2xl p-6 animate-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
        >
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  );
};

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score) * circumference;
  
  const getColor = (s: number) => {
    if (s >= 0.9) return "text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]";
    if (s >= 0.7) return "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]";
    return "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
  };

  return (
    <div className="relative flex items-center justify-center mb-4 mt-2 animate-in zoom-in duration-700">
      {/* Background Glow */}
      <div className={`absolute inset-0 bg-purple-500/10 blur-3xl rounded-full scale-150 opacity-50`} />
      
      <svg className="transform -rotate-90 w-56 h-56 relative z-10">
        {/* Track */}
        <circle 
          className="text-white/5" 
          strokeWidth="16" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="112" 
          cy="112" 
        />
        {/* Progress */}
        <circle 
          className={`${getColor(score)} transition-all duration-[1.5s] ease-out`} 
          strokeWidth="16" 
          strokeDasharray={circumference} 
          strokeDashoffset={offset} 
          strokeLinecap="round" 
          stroke="currentColor" 
          fill="transparent" 
          r={radius} 
          cx="112" 
          cy="112" 
        />
      </svg>
      <div className="absolute flex flex-col items-center z-20">
        <span className="text-5xl font-black text-white tracking-tighter tabular-nums text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
          {score.toFixed(2)}
        </span>
        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mt-2">
          Neynar Score
        </span>
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
    const text = `My Neynar Score is ${score.toFixed(2)}! 🏆\n\nCheck yours in the Neynar Score Mini App.`;
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
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-purple-500/30">
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black pointer-events-none" />
      
      <main className="relative max-w-md mx-auto p-6 flex flex-col min-h-screen pb-24">
        
        {/* Header */}
        <header className="flex items-center justify-between mb-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-900/20 border border-white/10">
              <Trophy size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-none tracking-tight">Neynar Score</h1>
            </div>
          </div>
          <div className="flex gap-2">
            {!isAdded && (
              <button 
                onClick={handleAddApp} 
                className="w-10 h-10 bg-white/5 backdrop-blur-md rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-colors border border-white/5"
              >
                <Bookmark size={18} />
              </button>
            )}
            {user?.pfpUrl && (
              <img 
                src={user.pfpUrl} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-white/10 shadow-sm"
              />
            )}
          </div>
        </header>

        <div className="flex-1 flex flex-col justify-center">
          
          {score === null ? (
            // --- Welcome State ---
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3">Hello, {user?.displayName || 'User'}</h2>
                <div className="bg-white/5 rounded-2xl p-5 border border-white/10 max-w-xs mx-auto backdrop-blur-sm">
                   <div className="flex items-center gap-2 mb-2 text-purple-300">
                      <ShieldCheck size={18} />
                      <span className="text-sm font-semibold uppercase tracking-wider">What is Neynar Score?</span>
                   </div>
                   <p className="text-sm text-gray-400 leading-relaxed text-left">
                     Neynar User Score is a reputation rating for Farcaster accounts, ranging from 0 to 1. It measures the quality and value of a user’s activity on the network, with higher scores indicating more trusted and positive contributions.
                   </p>
                </div>
              </div>

              <div className="w-24 h-24 bg-gradient-to-tr from-purple-500/20 to-indigo-500/10 rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl shadow-purple-900/20">
                <Search className="text-purple-300" size={36} />
              </div>
              <Button 
                onClick={handleCheckScore} 
                disabled={isLoadingScore}
                className="max-w-[220px]"
                variant="primary"
              >
                {isLoadingScore ? (
                  <><Loader2 className="animate-spin" size={18} /> Calculating...</>
                ) : (
                  'Check My Score'
                )}
              </Button>
            </div>
          ) : (
            // --- Result State (Optimized Layout) ---
            <div className="flex flex-col items-center w-full h-full">
              {/* Reduced margins on gauge to fit content better */}
              <div className="flex-shrink-0">
                <ScoreGauge score={score} />
              </div>

              <div className="w-full space-y-3 mt-4 animate-in slide-in-from-bottom-8 duration-500 delay-100 flex-shrink-0">
                <Button onClick={handleShare} icon={Share} variant="primary">
                  Share Score
                </Button>
                
                <Button 
                  onClick={() => setShowInfoModal(true)} 
                  variant="glass" 
                  className="justify-between group"
                >
                  <div className="flex items-center gap-2">
                    <Info size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                    <span>How to improve score?</span>
                  </div>
                  <ChevronRight size={16} className="text-gray-500 group-hover:text-white transition-colors" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Sticky Bottom Left Donate Button */}
      <div className="fixed bottom-6 left-6 z-40 animate-in slide-in-from-bottom-10 duration-700 delay-500">
         <button 
           onClick={handleDonate}
           disabled={donationStatus !== 'idle'}
           className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-full py-2 px-3.5 text-xs font-medium text-gray-300 flex items-center gap-2 hover:bg-white/10 hover:text-white hover:border-white/20 transition-all shadow-lg active:scale-95"
         >
            {donationStatus === 'success' ? (
              <CheckCircle2 size={14} className="text-emerald-500" />
            ) : (
              <Heart size={14} className="text-pink-500" />
            )}
            <span>{donationStatus === 'pending' ? '...' : donationStatus === 'success' ? 'Sent!' : 'Donate'}</span>
         </button>
      </div>

      {/* Info Modal */}
      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <div className="space-y-5">
          <div className="text-center pt-2">
            <h3 className="text-xl font-bold text-white mb-1">How to Improve Score?</h3>
            <p className="text-gray-400 text-xs">Based on community guidelines</p>
          </div>

          <div className="space-y-4 text-sm text-gray-300">
            <div className="space-y-3">
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                <div className="mt-0.5 bg-purple-500/20 p-1.5 rounded-lg text-purple-300 h-fit">
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-1">Authenticity</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    Don't be a bot. Avoid "gm" farming, thoughtless AI replies, or reposting stolen content. Authenticity wins.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                 <div className="mt-0.5 bg-blue-500/20 p-1.5 rounded-lg text-blue-300 h-fit">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-1">Profile Hygiene</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    Clean username (no random numbers), high-quality PFP, clear bio. Aim for a healthy following ratio.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                <div className="mt-0.5 bg-green-500/20 p-1.5 rounded-lg text-green-300 h-fit">
                  <MessageCircle size={16} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-1">Communication</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    Talk like a real person. Ask open questions. Engage with context. Don't just broadcast links or mini-apps.
                  </p>
                </div>
              </div>
              
              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                <div className="mt-0.5 bg-amber-500/20 p-1.5 rounded-lg text-amber-300 h-fit">
                  <Sparkles size={16} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-1">Content</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    Quality over quantity. Create content you would stop scrolling to read. Avoid spamming.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Button onClick={() => setShowInfoModal(false)} variant="secondary" className="w-full">
            Got it
          </Button>
        </div>
      </Modal>

    </div>
  );
}