import { ImageResponse } from 'next/og';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // 1. Get Params
    const scoreParam = searchParams.get('score');
    const username = searchParams.get('user') || 'User';
    const pfpUrl = searchParams.get('pfp'); // New Param
    const score = parseFloat(scoreParam || '0').toFixed(2);
    
    // 2. Load Font (Inter Bold)
    const fontUrl = 'https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff';
    const fontData = await fetch(fontUrl).then((res) => res.arrayBuffer());

    // 3. Load PFP (if provided)
    let pfpData: ArrayBuffer | null = null;
    if (pfpUrl) {
      try {
        const res = await fetch(pfpUrl);
        if (res.ok) pfpData = await res.arrayBuffer();
      } catch (e) {
        console.warn("Failed to fetch PFP", e);
      }
    }

    // 4. Determine Color Logic
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
            backgroundImage: `radial-gradient(circle at 50% 50%, #1a1a2e 0%, #000000 100%)`,
            fontFamily: '"Inter"',
          }}
        >
          {/* Main Glass Card Container */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '90%',
            height: '85%',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '40px',
            boxShadow: '0 0 80px rgba(0,0,0,0.5)',
            gap: '20px' // Flex gap simulation
          }}>
            
            {/* Header: PFP + Username */}
            <div style={{ display: 'flex', alignItems: 'center', marginTop: 40, marginBottom: 20 }}>
              {pfpData && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={pfpData as any}
                  alt=""
                  width="80"
                  height="80"
                  style={{
                    borderRadius: '50%',
                    marginRight: '25px',
                    border: '4px solid rgba(255,255,255,0.1)'
                  }}
                />
              )}
              <div style={{ 
                fontSize: 50, 
                color: '#e5e7eb', 
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
                border: `16px solid ${color}`, // Thicker border
                boxShadow: `0 0 60px ${glow}`,
                backgroundColor: 'rgba(0,0,0,0.4)', 
                position: 'relative',
              }}
            >
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}>
                <div style={{ 
                  fontSize: 110, 
                  fontWeight: 700,
                  color: '#ffffff',
                  lineHeight: 1,
                  textShadow: '0 4px 10px rgba(0,0,0,0.5)',
                }}>
                  {score}
                </div>
                <div style={{ 
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

            {/* Footer / Branding */}
            <div style={{ 
              marginTop: 'auto', 
              marginBottom: 40,
              fontSize: 24,
              color: '#6b7280',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center'
            }}>
              CHECK YOURS ON FARCASTER
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
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}