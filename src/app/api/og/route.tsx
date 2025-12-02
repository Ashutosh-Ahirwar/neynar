import { ImageResponse } from 'next/og';

// We use Node.js runtime for better stability with file fetching
// export const runtime = 'edge'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Get Params
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // 2. Load Font with Fallback
    // Using jsDelivr is much more reliable than raw GitHub links
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff';
    
    let fontData: ArrayBuffer | null = null;
    try {
      const res = await fetch(fontUrl);
      if (res.ok) {
        fontData = await res.arrayBuffer();
      } else {
        console.warn(`Failed to fetch font: ${res.status} ${res.statusText}`);
      }
    } catch (e) {
      console.warn("Font fetch failed, falling back to system font", e);
    }

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

    // Prepare fonts array only if fetch succeeded
    const fonts = fontData ? [
      {
        name: 'Inter',
        data: fontData,
        style: 'normal' as const,
        weight: 700 as const,
      },
    ] : undefined;

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
            // Simple radial gradient is safe
            backgroundImage: 'radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)',
            // Fallback to sans-serif if Inter fails
            fontFamily: fontData ? '"Inter"' : 'sans-serif',
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
                boxShadow: `0 0 50px ${glow}`,
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
        fonts: fonts, // Pass the fonts array (or undefined)
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error("OG Generation Error:", e);
    // Return a JSON error instead of crashing, easier to debug in browser
    return new Response(JSON.stringify({ error: `Failed to generate image: ${e.message}` }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}