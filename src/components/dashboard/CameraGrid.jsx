import React, { useEffect, useState } from 'react';
import { Camera, ExternalLink, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CameraGrid = () => {
    const navigate = useNavigate();
    const [cameras, setCameras] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('http://localhost:8000/api/cameras/')
            .then(res => res.json())
            .then(data => {
                setCameras(data.slice(0, 4)); // Limit to 4 for dashboard
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to fetch cameras:", err);
                setLoading(false);
            });
    }, []);

    const [timestamp, setTimestamp] = useState(Date.now());

    useEffect(() => {
        const interval = setInterval(() => {
            setTimestamp(Date.now());
        }, 2000); // refresh every 2s
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return <div className="animate-pulse h-48 bg-slate-800/50 rounded-xl" />;
    }

    return (
        <div className="glass-panel rounded-xl p-6 border border-white/5">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="text-blue-400" size={20} />
                    Live Feeds
                </h3>
                <button
                    onClick={() => navigate('/console')}
                    className="text-white bg-slate-800 hover:bg-slate-700 font-medium rounded-lg text-sm px-4 py-2 flex items-center gap-2 transition-colors border border-white/5"
                >
                    View All <ExternalLink size={14} />
                </button>
            </div>

            {cameras.length === 0 ? (
                <div className="h-40 flex flex-col items-center justify-center text-slate-400 bg-slate-800/30 rounded-lg border border-white/5 border-dashed">
                    <Camera size={32} className="mb-2 opacity-50" />
                    <p>No active cameras found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {cameras.map((cam) => (
                        <div
                            key={cam.id}
                            className="relative group aspect-video bg-black rounded-lg overflow-hidden border border-white/10 cursor-pointer"
                            onClick={() => navigate('/console')}
                        >
                            {/* Live Stream / Thumbnail */}
                            <img
                                src={`http://localhost:8000/api/cameras/${cam.id}/snapshot?t=${timestamp}`}
                                alt={cam.location}
                                className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = "https://via.placeholder.com/640x360?text=Stream+Offline";
                                }}
                            />

                            {/* Overlay Info */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                                <div>
                                    <p className="text-white font-medium text-sm truncate">{cam.location}</p>
                                    <p className="text-xs text-slate-300 font-mono">ID: {cam.id}</p>
                                </div>
                                <div className="flex items-center gap-1.5 bg-red-500/90 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-lg animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                                    LIVE
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                                <span className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg">
                                    Open Console
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CameraGrid;
