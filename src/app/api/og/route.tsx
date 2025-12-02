import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scoreParam = searchParams.get('score');
  const username = searchParams.get('user') || 'User';
  
  const score = parseFloat(scoreParam || '0');
  
  // Determine color based on score (matching your app logic)
  let color = '#fbbf24'; // amber
  let glow = 'rgba(251, 191, 36, 0.4)';
  if (score >= 0.9) {
    color = '#34d399'; // emerald
    glow = 'rgba(52, 211, 153, 0.4)';
  } else if (score >= 0.7) {
    color = '#a855f7'; // purple
    glow = 'rgba(168, 85, 247, 0.4)';
  }

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000000',
          fontFamily: 'sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Gradient */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to bottom, rgba(88, 28, 135, 0.2), #000000)',
            zIndex: 0,
          }}
        />

        {/* Content */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
          <div style={{ fontSize: 32, color: '#9ca3af', marginBottom: 20, fontWeight: 600 }}>
            @{username}'s Neynar Score
          </div>
          
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 300,
              height: 300,
              borderRadius: '50%',
              border: `12px solid ${color}`,
              boxShadow: `0 0 50px ${glow}`,
              backgroundColor: 'rgba(255,255,255,0.05)',
              marginBottom: 40,
            }}
          >
            <div style={{ fontSize: 96, fontWeight: 900, color: '#ffffff' }}>
              {score.toFixed(2)}
            </div>
          </div>

          <div style={{ fontSize: 24, color: '#6b7280', textTransform: 'uppercase', letterSpacing: 4 }}>
            Farcaster Reputation
          </div>
        </div>
        
        {/* Footer */}
        <div style={{ position: 'absolute', bottom: 40, display: 'flex', alignItems: 'center' }}>
           <div style={{ width: 40, height: 40, borderRadius: 10, background: 'linear-gradient(to right, #9333ea, #4f46e5)', marginRight: 15 }} />
           <div style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>Neynar Score</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}