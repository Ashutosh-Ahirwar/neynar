import { ImageResponse } from 'next/og';

// 1. REMOVE 'edge' runtime to use the standard Node.js runtime.
// This is more stable and prevents "silent" crashes.
// export const runtime = 'edge'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get Params
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    // Default to 0.00 if score is missing or invalid
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // 2. LOAD FONT MANUALLY
    // We fetch a standard font (Inter Bold) from a CDN. 
    // This is required in Node.js runtime because system fonts aren't available.
    const fontData = await fetch(
      new URL('https://github.com/google/fonts/raw/main/ofl/inter/Inter-Bold.ttf', import.meta.url)
    ).then((res) => res.arrayBuffer());

    // Determine Color Logic
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
            backgroundColor: '#050505', 
            // 3. SIMPLIFIED CSS
            // Complex gradients can sometimes cause issues. 
            // We use a simple radial gradient here.
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)',
            fontFamily: '"Inter"', // Must match the font name loaded below
          }}
        >
          {/* Content Layer */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)', 
          }}>
            
            {/* Username */}
            <div style={{ 
              display: 'flex',
              fontSize: 60, 
              color: '#e5e7eb', 
              marginBottom: 20, 
              fontWeight: 700,
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
                borderRadius: '150px',
                border: `12px solid ${color}`,
                boxShadow: `0 0 50px ${glow}`, // Simplified shadow for performance
                backgroundColor: 'rgba(0,0,0,0.3)', 
                marginBottom: 30,
              }}
            >
              <div style={{ 
                display: 'flex',
                fontSize: 100, 
                fontWeight: 700,
                color: '#ffffff' 
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
        // 4. INJECT FONT
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
    console.error("OG Generation Error:", e);
    return new Response(`Failed to generate image: ${e.message}`, { status: 500 });
  }
}