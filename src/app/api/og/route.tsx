import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    
    // Default to 0 if parsing fails
    const score = parseFloat(scoreParam || '0');
    
    // Determine color based on score
    let color = '#fbbf24'; // amber (default)
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
            backgroundColor: '#050505',
            fontFamily: 'sans-serif',
            position: 'relative',
          }}
        >
          {/* Background Gradient - using simple div for max compatibility */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, #1a1a2e, #000000)',
              zIndex: 0,
            }}
          />

          {/* Content Container */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
            {/* Username */}
            <div style={{ fontSize: 48, color: '#e5e7eb', marginBottom: 24, fontWeight: 700 }}>
              @{username}
            </div>
            
            {/* Score Circle */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 320,
                height: 320,
                borderRadius: '50%',
                border: `12px solid ${color}`,
                boxShadow: `0 0 80px ${glow}`,
                backgroundColor: 'rgba(0,0,0,0.4)',
                marginBottom: 40,
              }}
            >
              <div style={{ fontSize: 110, fontWeight: 900, color: '#ffffff' }}>
                {score.toFixed(2)}
              </div>
            </div>

            {/* Label */}
            <div style={{ fontSize: 32, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 6 }}>
              Neynar Score
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        headers: {
          'Cache-Control': 'no-store, no-cache', // Disable caching during debug
          'Content-Type': 'image/png',
        },
      }
    );
  } catch (e: any) {
    console.error(`OG Image Error: ${e.message}`);
    return new Response(`Failed to generate image`, { status: 500 });
  }
}