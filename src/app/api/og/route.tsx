import { ImageResponse } from 'next/og';

// Disable edge runtime for better compatibility with fonts and image generation limits
// export const runtime = 'edge'; 

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    
    const score = parseFloat(scoreParam || '0');
    
    // Determine color based on score
    let color = '#fbbf24'; // amber
    let glow = 'rgba(251, 191, 36, 0.4)';
    if (score >= 0.9) {
      color = '#34d399'; // emerald
      glow = 'rgba(52, 211, 153, 0.4)';
    } else if (score >= 0.7) {
      color = '#a855f7'; // purple
      glow = 'rgba(168, 85, 247, 0.4)';
    }

    // Fetch the Inter font from a reliable CDN
    // The previous Google Fonts URL likely expired or was invalid
    const fontData = await fetch(
      new URL('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff')
    ).then((res) => {
      if (!res.ok) throw new Error('Failed to load font');
      return res.arrayBuffer();
    });

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
            // Use background property for better compatibility
            background: 'linear-gradient(to bottom, #1a1a2e, #000000)',
            position: 'relative',
          }}
        >
          {/* Content */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
            <div style={{ fontSize: 60, color: '#e5e7eb', marginBottom: 20, fontWeight: 700 }}>
              @{username}
            </div>
            
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 280,
                height: 280,
                borderRadius: '140px', // Explicit pixel value for border-radius
                border: `10px solid ${color}`,
                boxShadow: `0 0 60px ${glow}`,
                backgroundColor: 'rgba(0,0,0,0.4)',
                marginBottom: 30,
              }}
            >
              <div style={{ fontSize: 90, fontWeight: 900, color: '#ffffff' }}>
                {score.toFixed(2)}
              </div>
            </div>

            <div style={{ fontSize: 32, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 4 }}>
              Neynar Score
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        fonts: [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 400,
          },
        ],
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error(`OG Generation Failed: ${e.message}`);
    return new Response(`Failed to generate the image: ${e.message}`, {
      status: 500,
    });
  }
}