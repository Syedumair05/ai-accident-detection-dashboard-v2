import React, { useState } from 'react';
import {
    Play, Pause, SkipBack, SkipForward, ZoomIn, ZoomOut, Maximize, Minimize, RotateCcw,
    Settings, Volume2
} from 'lucide-react';
import { motion } from 'framer-motion';

const VideoPlayer = ({ camera, clipUrl, onNext, onPrev }) => {
    const [isPlaying, setIsPlaying] = useState(true); // Default to play for live stream
    const [zoom, setZoom] = useState(1);
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const containerRef = React.useRef(null);
    const imgRef = React.useRef(null);
    const canvasRef = React.useRef(null);
    const videoRef = React.useRef(null); // Add video ref for clips

    // Determine what to play: Clip URL takes precedence over Live Stream
    const streamUrl = camera ? `http://localhost:8000/api/cameras/${camera.id}/stream?speed=${playbackSpeed}` : null;
    const activeUrl = clipUrl || streamUrl;
    const isClip = !!clipUrl;

    const handleSpeedChange = (newSpeed) => {
        setPlaybackSpeed(newSpeed);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`);
            });
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    React.useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
    }, []);

    // Sync Play/Pause state with Video Element
    React.useEffect(() => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.play().catch(e => console.log("Play interrupted", e));
            } else {
                videoRef.current.pause();
            }
        }
    }, [isPlaying, activeUrl, isClip]);

    React.useEffect(() => {
        if (!isPlaying && streamUrl && imgRef.current && canvasRef.current) {
            const img = imgRef.current;
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');

            const drawImageOnCanvas = () => {
                // Ensure canvas dimensions match the image for proper drawing
                canvas.width = img.naturalWidth || img.width;
                canvas.height = img.naturalHeight || img.height;

                if (ctx && img.complete && img.naturalWidth > 0) {
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                }
            };

            // If image is already loaded, draw it
            if (img.complete && img.naturalWidth > 0) {
                drawImageOnCanvas();
            } else {
                // Otherwise, wait for it to load
                img.onload = drawImageOnCanvas;
                img.onerror = () => {
                    console.error("Failed to load image for canvas capture.");
                };
            }
        } else if (isPlaying && canvasRef.current) {
            // Clear canvas when playing
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        }
    }, [isPlaying, streamUrl]);

    return (
        <div ref={containerRef} className="bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 relative group h-full flex flex-col">
            {/* Video Placeholder or Stream */}
            <div className="aspect-video bg-slate-900 relative flex-1 flex items-center justify-center overflow-hidden">
                {/* Canvas for Freeze Frame */}
                <canvas ref={canvasRef} className={`w-full h-full object-contain absolute inset-0 ${!isPlaying && activeUrl && !isClip ? 'block' : 'hidden'}`} />

                {activeUrl ? (
                    isClip ? (
                        <video
                            ref={videoRef}
                            src={activeUrl}
                            className={`w-full h-full object-contain`}
                            controls
                            autoPlay={isPlaying}
                            loop
                            onError={(e) => {
                                console.error("Video playback error", e);
                                // Fallback or UI indication could go here
                            }}
                        />
                    ) : (
                        <img
                            ref={imgRef}
                            src={activeUrl}
                            alt={camera ? camera.location : "Video"}
                            className={`w-full h-full object-contain ${!isPlaying ? 'hidden' : 'block'}`}
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/640x360?text=Stream+Offline";
                            }}
                        />
                    )
                ) : (
                    <>
                        {/* No Signal State */}
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black" />
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-30" />
                            <div className="z-10 text-white font-mono text-sm opacity-50">NO SIGNAL</div>
                        </div>
                    </>
                )}

                {/* Grid Lines Overlay */}
                <div className="absolute inset-0 grid grid-cols-4 grid-rows-3 opacity-20 pointer-events-none">
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="border-r border-white/30" />
                    <div className="" />
                </div>

                {/* Live Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${streamUrl ? 'bg-red-500 animate-pulse' : 'bg-slate-500'}`} />
                    <span className="text-xs font-mono text-white">
                        {streamUrl ? "LIVE" : "OFFLINE"}
                    </span>
                </div>

                {/* Camera Info */}
                <div className="absolute top-4 left-4 text-xs font-mono text-white/80 bg-black/60 backdrop-blur px-2 py-1 rounded border border-white/10">
                    {camera ? camera.location : "NO SIGNAL"} | 1080p | 30fps
                </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-slate-900 border-t border-white/10 p-4 sticky bottom-0 z-10">
                {/* Timeline */}
                <div className="mb-4 flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">14:30:00</span>
                    <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full relative cursor-pointer group/timeline">
                        <div className="absolute top-0 left-0 h-full w-[35%] bg-blue-500 rounded-full" />
                        <div className="absolute top-1/2 -translate-y-1/2 left-[35%] w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/timeline:opacity-100 transition-opacity" />
                        {/* Markers */}
                        <div className="absolute top-1/2 -translate-y-1/2 left-[32%] w-1.5 h-1.5 bg-red-500 rounded-full z-10" title="Incident Start" />
                    </div>
                    <span className="text-xs text-slate-400 font-mono">14:31:00</span>
                </div>

                <div className="flex justify-between items-center">
                    {/* Transport Controls */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="p-2 hover:bg-white/10 rounded-lg text-white transition-colors"
                        >
                            {isPlaying ? <Pause size={20} /> : <Play size={20} className="fill-white" />}
                        </button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <button onClick={onPrev} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><SkipBack size={18} /></button>
                        <button onClick={onNext} className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><SkipForward size={18} /></button>
                        <button
                            onClick={() => handleSpeedChange(0.5)}
                            className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold ${playbackSpeed === 0.5 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            0.5x
                        </button>
                        <button
                            onClick={() => handleSpeedChange(1.0)}
                            className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold ${playbackSpeed === 1.0 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            1x
                        </button>
                        <button
                            onClick={() => handleSpeedChange(2.0)}
                            className={`p-2 hover:bg-white/10 rounded-lg transition-colors text-xs font-bold ${playbackSpeed === 2.0 ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}
                        >
                            2x
                        </button>
                    </div>

                    {/* Tools */}
                    <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><ZoomOut size={18} /></button>
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><ZoomIn size={18} /></button>
                        <div className="w-px h-6 bg-white/10 mx-1" />
                        <button className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors"><RotateCcw size={18} /></button>
                        <button
                            onClick={toggleFullscreen}
                            className={`p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-colors ${isFullscreen ? 'bg-white/20 text-white' : ''}`}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                        >
                            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VideoPlayer;
