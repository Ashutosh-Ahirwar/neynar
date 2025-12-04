'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { sdk } from '@farcaster/miniapp-sdk';
import { 
  Trophy, Share, Heart, Bookmark, Loader2, CheckCircle2, Search, X, Info, ChevronRight, ShieldCheck, UserCheck, MessageCircle, Sparkles, AlertCircle
} from 'lucide-react';
// Import viem for standard wallet support
import { createWalletClient, custom, parseEther } from 'viem';
import { base } from 'viem/chains';

interface UserContext {
  fid: number;
  displayName?: string;
  username?: string;
  pfpUrl?: string;
}

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
  
  const isHighQuality = score >= 0.9;
  
  const getColor = (s: number) => {
    if (s >= 0.9) return "text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.6)]";
    if (s >= 0.7) return "text-purple-400 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]";
    return "text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]";
  };

  return (
    <div className="relative flex items-center justify-center mb-4 mt-2">
      {/* Background Glow - Static */}
      <div className={`absolute inset-0 ${isHighQuality ? 'bg-emerald-500/20' : 'bg-purple-500/10'} blur-3xl rounded-full scale-150 opacity-50`} />
      
      {/* Decorative Dots - Static */}
      {isHighQuality && (
        <div className="absolute inset-0">
           {[...Array(6)].map((_, i) => (
             <div key={i} className="absolute top-0 left-1/2 w-1 h-1 bg-emerald-400 rounded-full" style={{ transform: `rotate(${i * 60}deg) translateY(-100px)` }} />
           ))}
        </div>
      )}
      
      <svg className="transform -rotate-90 w-56 h-56 relative z-10">
        <circle className="text-white/5" strokeWidth="16" stroke="currentColor" fill="transparent" r={radius} cx="112" cy="112" />
        <circle 
          className={getColor(score)} 
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

export default function MiniApp() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<UserContext | null>(null);
  
  const [score, setScore] = useState<number | null>(null);
  const [isLoadingScore, setIsLoadingScore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [isAdded, setIsAdded] = useState(false);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [donationStatus, setDonationStatus] = useState<'idle' | 'pending' | 'success'>('idle');
  const [showInfoModal, setShowInfoModal] = useState(false);

  const handleAddApp = useCallback(async () => {
    try {
      await sdk.actions.addMiniApp();
      setIsAdded(true);
      setShowAddPopup(false);
    } catch (e) {
      console.error("Failed to add miniapp:", e);
    }
  }, []);

  const handleShare = useCallback(async () => {
    if (!user || score === null) return;
    
    let shareText = `My Neynar Score is ${score.toFixed(2)}!`;
    if (score >= 0.9) shareText = `I'm a top-tier user! My Neynar Score is ${score.toFixed(2)} 💎`;
    else if (score >= 0.7) shareText = `Checking my rep. Neynar Score: ${score.toFixed(2)} 🚀`;
    
    const text = `${shareText}\n\nCheck yours in the Neynar Score Mini App.`;
    
    const appUrl = process.env.NEXT_PUBLIC_URL || "https://neynar-lyart.vercel.app";
    const shareUrl = `${appUrl}/share?score=${score.toFixed(2)}&username=${encodeURIComponent(user.username || '')}&pfp=${encodeURIComponent(user.pfpUrl || '')}`;
    
    try {
      await sdk.actions.composeCast({ 
        text: text, 
        embeds: [shareUrl] 
      });
    } catch (e) {
      console.error("Failed to share:", e);
    }
  }, [score, user]);

  const handleDonate = useCallback(async () => {
    setDonationStatus('pending');
    
    const RECIPIENT = "0xa6DEe9FdE9E1203ad02228f00bF10235d9Ca3752";
    const AMOUNT_ETH = "0.0005";
    
    let success = false;

    // 1. Try Injected Wallet (Base App / MetaMask)
    // This is required for Base App where sdk.actions.sendToken might not work reliably yet
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const walletClient = createWalletClient({
          chain: base,
          transport: custom((window as any).ethereum)
        });
        
        const [address] = await walletClient.requestAddresses();
        
        await walletClient.sendTransaction({
          account: address,
          to: RECIPIENT as `0x${string}`,
          value: parseEther(AMOUNT_ETH),
          chain: base
        });
        
        success = true;
      } catch (e: any) {
        console.error("Wallet transaction failed:", e);
        // If user actively rejected, we stop here and reset
        if (e.code === 4001 || e.message?.toLowerCase().includes("reject")) {
           setDonationStatus('idle');
           return; 
        }
      }
    }

    // 2. Try Farcaster SDK (Fallback for Warpcast if injected wallet failed or missing)
    if (!success) {
      try {
        await sdk.actions.sendToken({
          token: "eip155:8453/native", 
          amount: "500000000000000", // 0.0005 ETH in Wei
          recipientAddress: RECIPIENT
        });
        success = true;
      } catch (e) {
        console.warn("SDK donation failed:", e);
      }
    }

    // 3. Final Fallback: Copy Address
    if (!success) {
      try {
        await navigator.clipboard.writeText(RECIPIENT);
        alert("Donation address copied to clipboard!"); 
        success = true; // Mark as success to show "Thank you" UI
      } catch (e) {
        console.error("Clipboard copy failed", e);
      }
    }

    if (success) {
      setDonationStatus('success');
      // Reset button after 2 seconds
      setTimeout(() => setDonationStatus('idle'), 2000);
    } else {
      setDonationStatus('idle');
    }
  }, []);

  const handleCheckScore = async () => {
    if (!user) return;
    setIsLoadingScore(true);
    setError(null);
    try {
      const response = await fetch(`/api/neynar/score?fid=${user.fid}`);
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to fetch score");
      }
      
      const data = await response.json();
      
      setScore(data.score);
      if (data.username && data.username !== user.username) {
        setUser(prev => prev ? { ...prev, username: data.username, pfpUrl: data.pfpUrl || prev.pfpUrl } : prev);
      }

    } catch (apiError: any) {
      console.error("Failed to fetch Neynar score:", apiError);
      setError(apiError.message || "Couldn't fetch score.");
      setScore(null);
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
          } else {
            setShowAddPopup(true);
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
            <div className="flex flex-col items-center animate-in zoom-in duration-500">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold mb-3">Hello, @{user?.username || 'user'}</h2>
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

              <div className="mb-4 w-full max-w-[220px]">
                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-xs bg-red-900/10 p-2 rounded-lg mb-3 justify-center">
                    <AlertCircle size={14} />
                    <span>{error}</span>
                  </div>
                )}
                
                <Button 
                  onClick={handleCheckScore} 
                  disabled={isLoadingScore}
                  variant="primary"
                  icon={isLoadingScore ? undefined : Search}
                >
                  {isLoadingScore ? (
                    <><Loader2 className="animate-spin" size={18} /> Calculating...</>
                  ) : (
                    'Check My Score'
                  )}
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center w-full h-full">
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
            <span>{donationStatus === 'pending' ? '...' : donationStatus === 'success' ? 'Thank you' : 'Donate'}</span>
         </button>
      </div>

      {/* --- ADD APP POPUP --- */}
      {showAddPopup && !isAdded && (
        <div className="fixed top-20 left-0 w-full flex justify-center pointer-events-auto z-50 animate-in fade-in slide-in-from-top-4">
          <div className="bg-[#151516]/95 border border-purple-500/30 p-4 rounded-2xl shadow-[0_0_30px_rgba(168,85,247,0.15)] max-w-[300px] flex flex-col gap-3 text-center backdrop-blur-md">
            <h3 className="font-bold text-lg text-white">Bookmark App?</h3>
            <p className="text-xs text-gray-300">Add to your apps to check your score anytime!</p>
            <div className="flex gap-2">
              <button 
                onClick={(e) => { e.stopPropagation(); setShowAddPopup(false); }}
                className="flex-1 py-2.5 text-xs text-gray-400 font-semibold hover:text-white transition-colors"
              >
                Later
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); handleAddApp(); }}
                className="flex-1 bg-purple-600 py-2.5 rounded-xl text-xs font-bold text-white hover:bg-purple-500 transition-colors shadow-lg shadow-purple-900/20"
              >
                Add App
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal isOpen={showInfoModal} onClose={() => setShowInfoModal(false)}>
        <div className="space-y-5">
          <div className="text-center pt-2">
            <h3 className="text-xl font-bold text-white mb-1">How to Improve Score?</h3>
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
                    Clean username, high-quality PFP, clear bio. Aim for a healthy following ratio.
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
                    Talk like a real person. Ask open questions. Engage with context.
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

              <div className="bg-white/5 p-3 rounded-xl border border-white/5 flex gap-3">
                <div className="mt-0.5 bg-red-500/20 p-1.5 rounded-lg text-red-300 h-fit">
                  <AlertCircle size={16} />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-xs uppercase tracking-wide mb-1">No Spam</h4>
                  <p className="text-xs leading-relaxed opacity-80">
                    Don't just post mini-apps or generic AI replies.
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