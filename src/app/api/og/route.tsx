import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    
    // Parse score, default to 0.00
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // Determine color based on score (matching your app logic)
    let color = '#fbbf24'; // amber
    let glow = '#fbbf24';
    const scoreNum = parseFloat(score);
    
    if (scoreNum >= 0.9) {
      color = '#34d399'; // emerald
      glow = '#34d399';
    } else if (scoreNum >= 0.7) {
      color = '#a855f7'; // purple
      glow = '#a855f7';
    }

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            height: '100%',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            // Use a reliable dark background color
            background: '#050505', 
            position: 'relative',
          }}
        >
          {/* Decorative Gradient Background Layer */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(to bottom, #1a1a2e, #000000)',
              opacity: 0.8,
            }}
          />

          {/* Content Layer */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            textShadow: '0 4px 20px rgba(0,0,0,0.8)', 
          }}>
            
            {/* Username */}
            <div style={{ 
              fontSize: 60, 
              color: '#e5e7eb', 
              marginBottom: 20, 
              fontWeight: 900,
              letterSpacing: '-1px'
            }}>
              @{username}
            </div>
            
            {/* Score Ring */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 300,
                height: 300,
                borderRadius: '150px', // Explicit px for safety
                border: `12px solid ${color}`,
                boxShadow: `0 0 80px ${glow}`,
                backgroundColor: 'rgba(0,0,0,0.5)', 
                marginBottom: 30,
              }}
            >
              <div style={{ fontSize: 100, fontWeight: 900, color: '#ffffff' }}>
                {score}
              </div>
            </div>

            {/* Label */}
            <div style={{ 
              fontSize: 32, 
              color: '#9ca3af', 
              textTransform: 'uppercase', 
              letterSpacing: '6px',
              fontWeight: 700
            }}>
              Neynar Score
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        // Crucial caching headers
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error(e);
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}