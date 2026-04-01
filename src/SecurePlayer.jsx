import React, { useState, useEffect, useRef } from 'react';

const SecurePlayer = () => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watermarkPos, setWatermarkPos] = useState({ top: '10%', left: '10%' });
    const [isFocused, setIsFocused] = useState(true);
    const [accessDenied, setAccessDenied] = useState(false);
    const playerContainerRef = useRef(null);

    // Hardcore Security Features
    useEffect(() => {
        // 1. DevTools Kill-Switch
        // Uses debugger loop and window resize detection to aggressively force redirection / kill access
        const checkDevToolsSize = () => {
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;
            if (widthDiff > 160 || heightDiff > 160) {
                setAccessDenied(true);
            }
        };

        const debuggerInterval = setInterval(() => {
            const before = performance.now();
            // This breakpoint pauses execution if DevTools is open.
            // If it takes more than 100ms to evaluate the next line, it means DevTools caught it.
            debugger; 
            const after = performance.now();
            if (after - before > 100) {
                setAccessDenied(true);
            }
            // Periodically check resize as a backup logic
            checkDevToolsSize();
        }, 1000);

        window.addEventListener('resize', checkDevToolsSize);
        checkDevToolsSize(); // Check initially on load
        
        // 2. Disable context menu (right-click) globally
        const blockContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', blockContextMenu);

        // 3. Aggressive Key & Event Blocking
        const blockKeys = async (e) => {
            // PrintScreen (Anti-Screenshot)
            if (e.key === "PrintScreen" || e.keyCode === 44) {
                e.preventDefault();
                try {
                    // Instantly flush the clipboard
                    await navigator.clipboard.writeText("");
                } catch(err) {
                    console.error("Clipboard wipe failed", err);
                }
                alert("Screenshot detected. Action blocked.");
                return false;
            }
            
            // F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S, Ctrl+P
            const isF12 = e.key === 'F12' || e.keyCode === 123;
            const isCtrlShiftI = e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73);
            const isCtrlU = e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.keyCode === 85);
            const isCtrlS = e.ctrlKey && (e.key === 'S' || e.key === 's' || e.keyCode === 83);
            const isCtrlP = e.ctrlKey && (e.key === 'P' || e.key === 'p' || e.keyCode === 80);

            if (isF12 || isCtrlShiftI || isCtrlU || isCtrlS || isCtrlP) {
                e.preventDefault();
                return false;
            }
        };
        window.addEventListener('keydown', blockKeys);

        // Block copying text globally
        const blockCopy = (e) => e.preventDefault();
        window.addEventListener('copy', blockCopy);

        // 4. Focus-Based Obscuration
        const handleBlur = () => setIsFocused(false);
        const handleFocus = () => setIsFocused(true);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(debuggerInterval);
            window.removeEventListener('resize', checkDevToolsSize);
            window.removeEventListener('contextmenu', blockContextMenu);
            window.removeEventListener('keydown', blockKeys);
            window.removeEventListener('copy', blockCopy);
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    // Fetch secure configuration from backend
    useEffect(() => {
        const fetchConfig = async () => {
            try {
                const response = await fetch('https://hls-backend.vercel.app/api/video-data');
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

    // Advanced Dynamic Watermark Repositioning Script
    useEffect(() => {
        const interval = setInterval(() => {
            // Keep watermark within safe margins (0% to 80%) vertically and horizontally
            const randomTop = Math.floor(Math.random() * 80) + '%';
            const randomLeft = Math.floor(Math.random() * 80) + '%';
            setWatermarkPos({ top: randomTop, left: randomLeft });
        }, 3000); // 3 seconds per requirements
        return () => clearInterval(interval);
    }, []);

    if (accessDenied) {
        return (
            <div className="flex h-96 flex-col items-center justify-center bg-red-950/40 rounded-xl border border-red-800 text-center p-8 shadow-2xl">
                <span className="text-red-500 font-extrabold text-4xl mb-4">ACCESS DENIED</span>
                <p className="text-red-200 text-lg max-w-lg">
                    Developer tools or unauthorized inspection systems were detected. Your session has been terminated to protect intellectual property.
                </p>
            </div>
        );
    }

    if (loading) return <div className="flex h-64 items-center justify-center text-slate-400">Authenticating secure connection...</div>;
    if (!videoData) return <div className="flex h-64 items-center justify-center text-red-500 font-semibold bg-red-950/20 rounded-xl border border-red-900/50">Error retrieving protected content. Make sure backend is running.</div>;

    const iframeSrc = `https://iframe.mediadelivery.net/embed/${videoData.libraryId}/${videoData.videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

    return (
        <div className="relative group">
            
            <div 
                ref={playerContainerRef} 
                className={`relative w-full overflow-hidden rounded-xl shadow-2xl bg-black border border-slate-700 transition-all duration-300 transform-gpu ${!isFocused ? 'blur-[20px] scale-95 opacity-80' : 'blur-none'}`}
                style={{ aspectRatio: '16/9' }}
            >
                {/* The underlying video player iframe */}
                <iframe
                    src={iframeSrc}
                    loading="lazy"
                    className="absolute top-0 left-0 w-full h-full border-0 focus:outline-none"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                ></iframe>

                {/* Invisible Shield Overlay (Anti-Screenshot/Anti-Interaction buffer layer) */}
                <div className="absolute inset-0 z-40 bg-transparent pointer-events-none"></div>

                {/* Advanced Dynamic Watermark Layer OVER the iframe */}
                <div 
                    className="absolute px-4 py-2 rounded pointer-events-none transition-all duration-[2500ms] ease-in-out font-mono font-bold text-sm z-50 select-none"
                    style={{ 
                        top: watermarkPos.top, 
                        left: watermarkPos.left, 
                        // Mix-blend-mode effectively bonds the text to the video making removal near impossible
                        mixBlendMode: 'overlay', 
                        color: 'rgba(255,255,255,0.7)',
                        textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
                    }}
                >
                    CONFIDENTIAL - {videoData.userData?.name || "Viewer"} - IP: {videoData.userData?.ip || "X.X.X.X"}
                </div>
            </div>

            {/* Focus Loss Warning Overlay */}
            {!isFocused && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none">
                    <div className="bg-black/80 backdrop-blur-md px-8 py-6 rounded-2xl border border-slate-600 shadow-2xl flex flex-col items-center animate-pulse">
                        <span className="text-white text-2xl font-bold mb-2 tracking-wide">PLAYBACK PAUSED</span>
                        <span className="text-slate-300 text-sm">Click here to resume focus</span>
                    </div>
                </div>
            )}
            
        </div>
    );
};

export default SecurePlayer;
