import React, { useState, useEffect, useRef } from 'react';

const SecurePlayer = () => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });
    const [devtoolsWarning, setDevtoolsWarning] = useState(false);
    const playerContainerRef = useRef(null);

    // Hardcore Security Features
    useEffect(() => {
        // DevTools detection - basic window sizing diff
        const handleResize = () => {
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;
            // threshold of 200px indicates the devtools pane might be opened
            if (widthDiff > 200 || heightDiff > 200) {
                setDevtoolsWarning(true);
                if (playerContainerRef.current) {
                    playerContainerRef.current.style.filter = "blur(15px)";
                }
            } else {
                setDevtoolsWarning(false);
                if (playerContainerRef.current) {
                    playerContainerRef.current.style.filter = "none";
                }
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial check just in case it's already open
        handleResize();
        
        // Disable context menu (right-click)
        const blockContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', blockContextMenu);

        // Disable specific shortcuts (Save, Inspect, PrintScreen)
        const blockKeys = (e) => {
            // PrintScreen, F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
            if (e.key === "PrintScreen" || e.keyCode === 44) {
                navigator.clipboard.writeText("Screen capture blocked.");
                e.preventDefault();
                return false;
            }
            if (e.key === 'F12') {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) {
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && (e.key === 'U' || e.key === 'u')) { // view source
                e.preventDefault();
                return false;
            }
            if (e.ctrlKey && (e.key === 'S' || e.key === 's')) { // save
                e.preventDefault();
                return false;
            }
        };
        window.addEventListener('keydown', blockKeys);

        // Block copying text inside the window level
        const blockCopy = (e) => e.preventDefault();
        window.addEventListener('copy', blockCopy);
        
        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('contextmenu', blockContextMenu);
            window.removeEventListener('keydown', blockKeys);
            window.removeEventListener('copy', blockCopy);
        };
    }, []);

    // Fetch config from backend
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('http://localhost:5000/api/video-data');
                if (response.ok) {
                    const data = await response.json();
                    setVideoData(data);
                } else {
                    console.error("Failed to fetch video configuration.");
                }
            } catch (err) {
                console.error("Error connecting to backend.", err);
            }
            setLoading(false);
        };
        fetchConfig();
    }, []);

    // Random Watermark Repositioning Script
    useEffect(() => {
        const interval = setInterval(() => {
            // Keep watermark within safe margins (0% to 85%)
            const randomTop = Math.floor(Math.random() * 85) + '%';
            const randomLeft = Math.floor(Math.random() * 85) + '%';
            setWatermarkPos({ top: randomTop, left: randomLeft });
        }, 5000); // Reposition every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">Loading secure connection...</div>;
    if (!videoData) return <div className="flex h-64 items-center justify-center text-red-500 font-semibold bg-red-950/20 rounded-xl border border-red-900/50">Error retrieving protected content.</div>;

    const iframeSrc = `https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

    return (
        <div className="relative">
            {devtoolsWarning && (
                <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md rounded-xl border border-red-500/50 p-6 text-center">
                    <span className="text-red-500 font-bold text-2xl mb-2">Security Warning</span>
                    <p className="text-white">Developer tools detected. Video playback is paused/obscured to protect intellectual property.</p>
                </div>
            )}
            
            <div 
                ref={playerContainerRef} 
                className="relative w-full overflow-hidden rounded-xl shadow-2xl bg-black border border-slate-700 transition-all duration-300 transform-gpu"
                style={{ aspectRatio: '16/9' }}
            >
                {/* The underlying video player iframe */}
                <iframe
                    src={iframeSrc}
                    loading="lazy"
                    className="absolute top-0 left-0 w-full h-full border-0"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                ></iframe>

                {/* Dynamic Watermark Layer OVER the iframe */}
                <div 
                    className="absolute text-white bg-black/40 px-3 py-1.5 rounded backdrop-blur-md transition-all duration-1000 ease-in-out font-mono font-semibold text-sm z-40 pointer-events-none shadow-lg"
                    style={{ 
                        top: watermarkPos.top, 
                        left: watermarkPos.left, 
                    }}
                >
                    {videoData.userData?.name || "Viewer"} - Protected Content<br/>
                    <span className="text-xs text-slate-300">IP: {videoData.userData?.ip || "X.X.X.X"}</span>
                </div>
            </div>
        </div>
    );
};

export default SecurePlayer;
