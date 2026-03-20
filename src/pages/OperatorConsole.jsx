import React, { useState } from 'react';
import { Camera, ChevronDown, ChevronUp } from 'lucide-react';
import Header from '../components/Header';
import AlertQueue from '../components/console/AlertQueue';
import VideoPlayer from '../components/console/VideoPlayer';
import IncidentDetails from '../components/console/IncidentDetails';

const OperatorConsole = () => {
    const [activeAlert, setActiveAlert] = useState({
        id: 'ACC_001',
        priority: 'critical',
        time: '14:30:45',
        location: 'Main St & 5th Ave',
        type: 'Accident',
        videoUrl: 'http://localhost:8000/clips/demo_clip.webm' // Demo clip
    });
    const [isGridCollapsed, setIsGridCollapsed] = useState(false);
    const [cameras, setCameras] = useState([]);
    const [selectedCamera, setSelectedCamera] = useState(null);

    React.useEffect(() => {
        // Fetch cameras from backend
        fetch('http://localhost:8000/api/cameras/')
            .then(res => res.json())
            .then(data => {
                setCameras(data);
                if (data.length > 0) {
                    setSelectedCamera(data[0]);
                }
            })
            .catch(err => console.error("Failed to fetch cameras:", err));
    }, []);

    const handleNextCamera = () => {
        if (cameras.length === 0) return;
        const currentIndex = cameras.findIndex(c => c.id === selectedCamera?.id);
        const nextIndex = (currentIndex + 1) % cameras.length;
        setSelectedCamera(cameras[nextIndex]);
        // Clear active alert video to show live feed
        if (activeAlert?.videoUrl) {
            setActiveAlert({ ...activeAlert, videoUrl: null });
        }
    };

    const handlePrevCamera = () => {
        if (cameras.length === 0) return;
        const currentIndex = cameras.findIndex(c => c.id === selectedCamera?.id);
        const prevIndex = (currentIndex - 1 + cameras.length) % cameras.length;
        setSelectedCamera(cameras[prevIndex]);
        // Clear active alert video to show live feed
        if (activeAlert?.videoUrl) {
            setActiveAlert({ ...activeAlert, videoUrl: null });
        }
    };

    // Auto-refresh snapshots for the grid (1 FPS)
    const [snapshotTick, setSnapshotTick] = useState(0);
    React.useEffect(() => {
        const interval = setInterval(() => {
            setSnapshotTick(t => t + 1);
        }, 1000); // 1 Second refresh rate for grid
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="h-screen bg-black text-white flex flex-col overflow-hidden">
            <Header />

            <div className="flex-1 flex overflow-hidden">
                {/* Left Sidebar: Alert Queue */}
                <AlertQueue
                    activeAlertId={activeAlert?.id}
                    onSelectAlert={setActiveAlert}
                />

                {/* Center: Work Area */}
                <div className="flex-1 flex flex-col bg-slate-950 px-1 border-r border-white/10 overflow-hidden relative">

                    {/* Work Area Header */}
                    <div className="h-10 flex items-center px-4 border-b border-white/10 bg-slate-900/50">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Video Review & Inspection</span>
                        <span className="mx-2 text-slate-600">|</span>
                        <span className="text-xs text-blue-400 font-medium">PRIMARY WORK AREA</span>
                    </div>

                    {/* Main Video View */}
                    <div className="flex-1 p-4 flex flex-col justify-center overflow-y-auto w-full max-w-5xl mx-auto">
                        <VideoPlayer
                            key={selectedCamera?.id + (activeAlert?.videoUrl || 'live')}
                            camera={selectedCamera}
                            clipUrl={activeAlert?.videoUrl}
                            onNext={handleNextCamera}
                            onPrev={handlePrevCamera}
                        />
                    </div>

                    {/* Bottom Multi-Camera Grid (Collapsible) */}
                    <div className={`bg-slate-900 border-t border-white/10 transition-all duration-300 ${isGridCollapsed ? 'h-10' : 'h-48'}`}>
                        <div
                            className="h-10 px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 border-b border-white/5"
                            onClick={() => setIsGridCollapsed(!isGridCollapsed)}
                        >
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
                                <Camera size={14} /> Multi-Camera Grid ({cameras.length})
                            </div>
                            {isGridCollapsed ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>

                        {!isGridCollapsed && (
                            <div className="p-2 grid grid-cols-6 gap-2 h-36 overflow-x-auto">
                                {cameras.map((cam) => (
                                    <div
                                        key={cam.id}
                                        className={`bg-black border rounded relative group overflow-hidden cursor-pointer ${selectedCamera?.id === cam.id ? 'border-blue-500' : 'border-slate-700'}`}
                                        onClick={() => {
                                            setSelectedCamera(cam);
                                            if (activeAlert?.videoUrl) {
                                                setActiveAlert({ ...activeAlert, videoUrl: null });
                                            }
                                        }}
                                    >
                                        <div className={`absolute inset-0 transition-opacity ${selectedCamera?.id === cam.id ? 'bg-transparent' : 'bg-slate-800 opacity-50 group-hover:opacity-0'}`} />

                                        {/* Snapshot Stream (1 FPS) */}
                                        <img
                                            src={`http://localhost:8000/api/cameras/${cam.id}/snapshot?t=${snapshotTick}`}
                                            alt={cam.location}
                                            className={`w-full h-full object-cover transition-opacity ${selectedCamera?.id === cam.id ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
                                            loading="lazy"
                                        />

                                        <div className="absolute bottom-1 left-1 text-[10px] bg-black/60 px-1 rounded text-white font-mono truncate max-w-full">
                                            {cam.location}
                                        </div>
                                    </div>
                                ))}
                                {cameras.length === 0 && (
                                    <div className="col-span-6 flex items-center justify-center text-slate-500 text-sm">
                                        No cameras found. Register videos in backend.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Incident Details */}
                <IncidentDetails alert={activeAlert} />

            </div>
        </div>
    );
};

const LiveThumbnail = ({ camera, isSelected }) => {
    const [ver, setVer] = useState(0);

    React.useEffect(() => {
        const interval = setInterval(() => {
            setVer(v => v + 1);
        }, 1000); // Update every 1 second (1 FPS)
        return () => clearInterval(interval);
    }, []);

    return (
        <img
            src={`http://localhost:8000/api/cameras/${camera.id}/snapshot?t=${ver}`}
            alt={camera.location}
            className={`w-full h-full object-cover transition-opacity ${isSelected ? 'opacity-100' : 'opacity-60 group-hover:opacity-100'}`}
            loading="lazy"
        />
    );
};

export default OperatorConsole;
