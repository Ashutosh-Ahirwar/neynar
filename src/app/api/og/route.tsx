import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Get Params
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    const pfpUrl = searchParams.get('pfp'); 
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // 2. Load Font
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff';
    let fontData: ArrayBuffer | null = null;
    
    try {
      const res = await fetch(fontUrl);
      if (res.ok) fontData = await res.arrayBuffer();
    } catch (e) {
      console.warn("Font fetch error:", e);
    }

    // 3. Load PFP
    let pfpSrc: string | null = null;
    if (pfpUrl && pfpUrl !== 'undefined' && pfpUrl !== 'null') {
      try {
        const res = await fetch(pfpUrl);
        if (res.ok) {
          const buffer = await res.arrayBuffer();
          const base64 = Buffer.from(buffer).toString('base64');
          const contentType = res.headers.get('content-type') || 'image/png';
          pfpSrc = `data:${contentType};base64,${base64}`;
        }
      } catch (e) {
        console.warn("PFP fetch error:", e);
      }
    }

    // 4. Color Logic - Fixed to specific color request
    const color = '#7c60fd'; 
    const glow = '#7c60fd';

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
            backgroundImage: `radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)`,
            fontFamily: fontData ? '"Inter"' : 'sans-serif',
          }}
        >
          {/* Main Glass Card with Curved Edges */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '85%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)', // Glass effect
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '40px', // The curved edges
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
          }}>
            
            {/* Header: PFP + Username */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              marginTop: 40, 
              marginBottom: 40
            }}>
              {pfpSrc ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pfpSrc}
                  alt=""
                  width="80"
                  height="80"
                  style={{
                    borderRadius: '50%',
                    marginRight: '25px',
                    border: '4px solid rgba(255,255,255,0.1)',
                    objectFit: 'cover'
                  }}
                />
              ) : null}
              
              <div style={{ 
                display: 'flex',
                fontSize: 50, 
                color: '#ffffff', // Explicitly white
                fontWeight: 700,
                letterSpacing: '-1px'
              }}>
                @{username}
              </div>
            </div>
            
            {/* Score Ring */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 320,
                height: 320,
                borderRadius: '50%',
                border: `16px solid ${color}`,
                boxShadow: `0 0 60px ${glow}`,
                backgroundColor: 'rgba(0,0,0,0.4)', 
              }}
            >
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                height: '100%'
              }}>
                <div style={{ 
                  display: 'flex',
                  fontSize: 110, 
                  fontWeight: 700,
                  color: '#ffffff', // Explicitly white
                  lineHeight: 1,
                  textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}>
                  {score}
                </div>
                <div style={{ 
                  display: 'flex',
                  fontSize: 24, 
                  color: color, 
                  marginTop: 10,
                  textTransform: 'uppercase', 
                  letterSpacing: '4px',
                  fontWeight: 700
                }}>
                  Neynar Score
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{ 
              marginTop: 'auto', 
              marginBottom: 40,
              fontSize: 24,
              color: '#ffffff', // Changed to white as requested
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              textTransform: 'uppercase',
              letterSpacing: '2px',
              opacity: 0.8
            }}>
              CHECK YOURS ON MINIAPP
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 800,
        fonts: fontData ? [
          {
            name: 'Inter',
            data: fontData,
            style: 'normal',
            weight: 700,
          },
        ] : undefined,
        headers: {
          'Cache-Control': 'public, max-age=3600, immutable',
        },
      }
    );
  } catch (e: any) {
    console.error("OG Generation Error:", e);
    return new Response(JSON.stringify({ error: e.message, stack: e.stack }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}