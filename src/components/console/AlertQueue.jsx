import React, { useState } from 'react';
import { AlertTriangle, Clock, MapPin, ChevronRight, Filter } from 'lucide-react';

const AlertQueue = ({ onSelectAlert, activeAlertId }) => {
    const alerts = [
        { id: 'ACC_001', priority: 'critical', time: '14:30:45', location: 'Main St & 5th Ave', type: 'Accident' },
        { id: 'ACC_002', priority: 'high', time: '14:28:10', location: 'Highway Exit 3', type: 'Stalled Vehicle' },
        { id: 'ACC_003', priority: 'medium', time: '14:15:22', location: 'Parking Area B', type: 'Illegal Parking' },
        { id: 'ACC_004', priority: 'low', time: '14:05:00', location: 'Zone 4 Entrance', type: 'Loitering' },
        { id: 'ACC_005', priority: 'low', time: '13:55:12', location: 'Zone 2 Loading', type: 'Obstruction' },
    ];

    const priorityStyles = {
        critical: 'bg-red-500 text-white shadow-red-500/50',
        high: 'bg-orange-500 text-white shadow-orange-500/50',
        medium: 'bg-yellow-500 text-black shadow-yellow-500/50',
        low: 'bg-emerald-500 text-white shadow-emerald-500/50',
    };

    const priorityDotStyles = {
        critical: 'bg-red-500 animate-pulse',
        high: 'bg-orange-500',
        medium: 'bg-yellow-500',
        low: 'bg-emerald-500',
    };

    return (
        <div className="bg-slate-900 border-r border-white/10 w-80 flex-shrink-0 flex flex-col h-[calc(100vh-64px)] overflow-hidden">
            <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-white font-semibold flex items-center gap-2">
                    Alert Queue
                    <span className="text-xs bg-red-600 text-white px-1.5 py-0.5 rounded-full">{alerts.length}</span>
                </h2>
                <button className="text-slate-400 hover:text-white transition-colors">
                    <Filter size={16} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {alerts.map((alert) => (
                    <div
                        key={alert.id}
                        onClick={() => onSelectAlert(alert)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all hover:translate-x-1 duration-200 ${activeAlertId === alert.id
                            ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/20'
                            : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80'
                            }`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <span className={`h-2 w-2 rounded-full ${priorityDotStyles[alert.priority]}`} />
                                <span className="text-white font-medium text-sm">{alert.type}</span>
                            </div>
                            <span className={`text-[10px] items-center px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${alert.priority === 'critical' ? 'text-red-400 bg-red-500/10' :
                                alert.priority === 'high' ? 'text-orange-400 bg-orange-500/10' :
                                    alert.priority === 'medium' ? 'text-yellow-400 bg-yellow-500/10' :
                                        'text-emerald-400 bg-emerald-500/10'
                                }`}>
                                {alert.priority}
                            </span>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <Clock size={12} />
                                <span>{alert.time}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <MapPin size={12} />
                                <span className="truncate">{alert.location}</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                            <span className="text-[10px] text-slate-500 font-mono">{alert.id}</span>
                            <ChevronRight size={14} className={`text-slate-600 ${activeAlertId === alert.id ? 'text-blue-400' : ''}`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AlertQueue;
