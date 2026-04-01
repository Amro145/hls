import React, { useState, useEffect, useRef } from 'react';

const SecurePlayer = () => {
    const [videoData, setVideoData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [watermarkPos, setWatermarkPos] = useState({ top: '50%', left: '50%' });
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
            // threshold of 160px indicates the devtools pane might be opened
            if (widthDiff > 160 || heightDiff > 160) {
                setAccessDenied(true);
            }
        };

        const debuggerInterval = setInterval(() => {
            const before = performance.now();
            // This breakpoint pauses execution if DevTools is open.
            debugger; 
            const after = performance.now();
            if (after - before > 100) {
                setAccessDenied(true);
            }
            // Backup check
            checkDevToolsSize();
        }, 1000);

        window.addEventListener('resize', checkDevToolsSize);
        checkDevToolsSize(); // Initial check
        
        // 2. Disable context menu (right-click) globally
        const blockContextMenu = (e) => e.preventDefault();
        window.addEventListener('contextmenu', blockContextMenu);
        document.addEventListener('contextmenu', blockContextMenu);

        // 3. Aggressive Key & Event Blocking
        const blockKeys = async (e) => {
            // PrintScreen (Anti-Screenshot)
            if (e.key === "PrintScreen" || e.keyCode === 44) {
                e.preventDefault();
                try {
                    // Instantly write "Protected Content" to clipboard to wipe screenshot data
                    await navigator.clipboard.writeText("Protected Content");
                } catch(err) {
                    console.error("Clipboard wipe failed", err);
                }
                alert("Screenshots are strictly prohibited. Clipboard cleared.");
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
        document.addEventListener('keydown', blockKeys);

        // Block copying text globally
        const blockCopy = (e) => e.preventDefault();
        window.addEventListener('copy', blockCopy);
        document.addEventListener('copy', blockCopy);

        // 4. Focus-Based Obscuration
        const handleBlur = () => setIsFocused(false);
        const handleFocus = () => setIsFocused(true);
        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);
        
        return () => {
            clearInterval(debuggerInterval);
            window.removeEventListener('resize', checkDevToolsSize);
            window.removeEventListener('contextmenu', blockContextMenu);
            document.removeEventListener('contextmenu', blockContextMenu);
            window.removeEventListener('keydown', blockKeys);
            document.removeEventListener('keydown', blockKeys);
            window.removeEventListener('copy', blockCopy);
            document.removeEventListener('copy', blockCopy);
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
                    console.warn("Using fallback local data due to backend strictly configured on vercel.");
                    // Fallback using requirements directly if backend API fails
                    setVideoData({
                        libraryId: "629034",
                        videoId: "78bf7019-ac8b-40b9-bdde-108741efd96c",
                        userData: { name: "Amro Altayeb", ip: "192.168.1.1" }
                    });
                }
            } catch (err) {
                console.warn("Backend unaccessible. Applying secure fallback data.");
                setVideoData({
                    libraryId: "629034",
                    videoId: "78bf7019-ac8b-40b9-bdde-108741efd96c",
                    userData: { name: "Amro Altayeb", ip: "192.168.1.1" }
                });
            }
            setLoading(false);
        };
        fetchConfig();
    }, []);

    // Advanced Dynamic Watermark Repositioning Script (Every 3 seconds)
    useEffect(() => {
        const interval = setInterval(() => {
            // Keep watermark within safe margins (0% to 85%) vertically and horizontally
            const randomTop = Math.floor(Math.random() * 85) + '%';
            const randomLeft = Math.floor(Math.random() * 85) + '%';
            setWatermarkPos({ top: randomTop, left: randomLeft });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    if (accessDenied) {
        // If DevTools detected, remove Iframe entirely and show Access Denied
        return (
            <div className="flex h-[450px] flex-col items-center justify-center bg-slate-950 rounded-xl border border-red-900/50 text-center p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-red-950/20 z-0"></div>
                <div className="z-10 flex flex-col items-center">
                    <span className="text-red-500 font-extrabold text-4xl mb-4 tracking-wider">ACCESS DENIED</span>
                    <p className="text-slate-300 text-lg max-w-md border-t border-red-900/50 pt-4">
                        Developer tools or unauthorized inspection systems detected. Content payload destroyed.
                    </p>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex h-64 items-center justify-center text-slate-500 font-mono animate-pulse">Initializing Secure Tunnel...</div>;
    
    // Explicitly use the newly required ID and fall back to API if available
    const libraryId = videoData?.libraryId || "629034";
    const videoId = videoData?.videoId || "78bf7019-ac8b-40b9-bdde-108741efd96c";
    const iframeSrc = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=true&loop=false&muted=false&preload=true&responsive=true`;

    return (
        <div className="relative group w-full bg-slate-950 p-1 md:p-2 rounded-2xl border border-slate-800 shadow-2xl">
            
            <div 
                ref={playerContainerRef} 
                className="relative w-full overflow-hidden rounded-xl bg-black transition-all duration-300 transform-gpu"
                style={{ aspectRatio: '16/9' }}
            >
                {/* 1. Underlying Video Player Iframe */}
                <iframe
                    src={iframeSrc}
                    loading="lazy"
                    className="absolute top-0 left-0 w-full h-full border-0 focus:outline-none"
                    allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;"
                    allowFullScreen={true}
                ></iframe>

                {/* 2. Invisible Overlay (Anti-Screenshot shield layer) */}
                <div 
                    className="absolute inset-0 z-40 bg-transparent pointer-events-none"
                    aria-hidden="true"
                ></div>

                {/* 3. Advanced Dynamic Watermark Layer */}
                <div 
                    className="absolute px-4 py-2 pointer-events-none font-mono font-bold text-xs sm:text-sm z-50 select-none whitespace-nowrap"
                    style={{ 
                        top: watermarkPos.top, 
                        left: watermarkPos.left, 
                        // Movement Logic: smooth transition
                        transition: 'top 3s linear, left 3s linear',
                        // Visuals requirement
                        opacity: 0.2,
                        mixBlendMode: 'overlay', 
                        color: '#ffffff',
                        textShadow: '0px 0px 4px rgba(0,0,0,1)'
                    }}
                >
                    CONFIDENTIAL - {videoData?.userData?.name || "Amro Altayeb"} - IP: {videoData?.userData?.ip || "X.X.X.X"}
                </div>

                {/* 4. Window Blur Protection (Focus-Based Obscuration) */}
                {!isFocused && (
                    <div className="absolute inset-0 z-[60] flex flex-col items-center justify-center transition-all duration-300 pointer-events-none">
                        {/* Heavy CSS blur mask */}
                        <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[40px]"></div>
                        
                        {/* Message Overlay */}
                        <div className="relative z-10 bg-slate-900/90 border border-slate-700/50 px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center">
                            <svg className="w-10 h-10 text-emerald-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                            </svg>
                            <span className="text-white text-xl md:text-2xl font-bold mb-2 tracking-wide text-center">Playback paused for security</span>
                            <span className="text-slate-400 text-sm text-center">Click anywhere in the window to resume focus</span>
                        </div>
                    </div>
                )}
            </div>
            
        </div>
    );
};

export default SecurePlayer;
