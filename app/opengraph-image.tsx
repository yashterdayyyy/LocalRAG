import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

export const alt = 'LocalRAG - AI Knowledge Assistant'
export const size = {
    width: 1200,
    height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
                    backgroundImage: 'radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.2) 2%, transparent 0%), radial-gradient(circle at 75px 75px, rgba(255, 255, 255, 0.2) 2%, transparent 0%)',
                    backgroundSize: '100px 100px',
                }}
            >
                {/* Background Glows */}
                <div
                    style={{
                        position: 'absolute',
                        top: '-20%',
                        left: '-10%',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, rgba(99,102,241,0.4) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: '-20%',
                        right: '-10%',
                        width: '600px',
                        height: '600px',
                        background: 'radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)',
                        filter: 'blur(80px)',
                    }}
                />

                {/* Neural Core Representation */}
                <div
                    style={{
                        display: 'flex',
                        marginBottom: '40px',
                        position: 'relative',
                    }}
                >
                    {/* Central Brain Icon Representation */}
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(99,102,241,1) 0%, rgba(168,85,247,1) 100%)',
                            boxShadow: '0 0 50px rgba(99,102,241,0.6)',
                        }}
                    >
                        <svg
                            width="64"
                            height="64"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M12 16v-4" />
                            <path d="M12 8h.01" />
                            <path d="M20.5 12a8.5 8.5 0 1 1-2.6-6.1" />
                            <path d="M9.5 7.5a2.5 2.5 0 0 1 0-5 2.5 2.5 0 0 1 0 5Z" />
                            <path d="M14.5 16.5a2.5 2.5 0 0 1 0 5 2.5 2.5 0 0 1 0-5Z" />
                            <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
                        </svg>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                    }}
                >
                    <div
                        style={{
                            fontSize: 72,
                            fontWeight: 800,
                            background: 'linear-gradient(to bottom, #ffffff, #a5a5a5)',
                            backgroundClip: 'text',
                            color: 'transparent',
                            letterSpacing: '-0.05em',
                        }}
                    >
                        LocalRAG
                    </div>
                    <div
                        style={{
                            fontSize: 32,
                            color: '#9ca3af',
                            fontWeight: 400,
                            letterSpacing: '-0.02em',
                        }}
                    >
                        Your personal knowledge base, supercharged by AI.
                    </div>
                </div>

                {/* Feature Tags */}
                <div
                    style={{
                        display: 'flex',
                        gap: '20px',
                        marginTop: '40px',
                    }}
                >
                    {['Semantic Search', 'Context Awareness', 'Instant Retrieval'].map((tag) => (
                        <div
                            key={tag}
                            style={{
                                padding: '10px 20px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '20px',
                                color: '#e5e7eb',
                                fontSize: 20,
                            }}
                        >
                            {tag}
                        </div>
                    ))}
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
