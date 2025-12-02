import { ImageResponse } from 'next/og';

// ❌ REMOVED 'edge' runtime. We use default Node.js for better stability.
// export const runtime = 'edge'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Get Params
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // 2. Load Font (Critical for Node.js runtime)
    // We use a public CDN for Inter-Bold to ensure it always renders
    const fontData = await fetch(
      new URL('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    // 3. Determine Color Logic
    let color = '#fbbf24'; // amber
    const scoreNum = parseFloat(score);
    if (scoreNum >= 0.9) color = '#34d399'; // emerald
    else if (scoreNum >= 0.7) color = '#a855f7'; // purple

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
            backgroundColor: '#0f0518', // Same dark bg as Flappy Warplet
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #0f0518 100%)',
            fontFamily: '"Inter"',
          }}
        >
          {/* Username */}
          <div style={{ 
            display: 'flex',
            fontSize: 60, 
            color: '#e5e7eb', 
            marginBottom: 20, 
            fontWeight: 700,
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
              borderRadius: '150px',
              border: `12px solid ${color}`,
              backgroundColor: 'rgba(0,0,0,0.3)',
              boxShadow: `0 0 50px ${color}`, // Simplified shadow
              marginBottom: 30,
            }}
          >
            <div style={{ 
              display: 'flex',
              fontSize: 100, 
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 4px 10px rgba(0,0,0,0.5)',
            }}>
              {score}
            </div>
          </div>

          {/* Label */}
          <div style={{ 
            display: 'flex',
            fontSize: 32, 
            color: '#9ca3af', 
            textTransform: 'uppercase', 
            letterSpacing: '4px',
            fontWeight: 700
          }}>
            Neynar Score
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800, // Standard OG size (matches Flappy Warplet)
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ],
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error("OG Error:", e);
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}