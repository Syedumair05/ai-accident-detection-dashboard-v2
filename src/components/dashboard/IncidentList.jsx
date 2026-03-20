import React from 'react';
import { AlertCircle, Clock, MapPin } from 'lucide-react';

const IncidentList = () => {
    const incidents = [
        { id: 1, time: '14:30', severity: 'Critical', location: 'Main St & 5th Ave', type: 'Accident' },
        { id: 2, time: '13:05', severity: 'Medium', location: 'Highway Exit 3', type: 'Stalled Vehicle' },
        { id: 3, time: '11:42', severity: 'Low', location: 'Parking Area', type: 'Illegal Parking' },
    ];

    const severityStyles = {
        Critical: 'text-red-500 bg-red-500/10 border-red-500/20',
        High: 'text-orange-500 bg-orange-500/10 border-orange-500/20',
        Medium: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
        Low: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    };

    return (
        <div className="space-y-3">
            {incidents.map((incident) => (
                <div
                    key={incident.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-slate-800/40 border border-white/5 hover:bg-slate-800/60 transition-colors group cursor-pointer"
                >
                    <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg border ${severityStyles[incident.severity]}`}>
                            <AlertCircle size={18} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${severityStyles[incident.severity]}`}>
                                    {incident.severity.toUpperCase()}
                                </span>
                                <span className="text-slate-200 font-medium text-sm">{incident.type}</span>
                            </div>
                            <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Clock size={12} /> {incident.time}</span>
                                <span className="flex items-center gap-1"><MapPin size={12} /> {incident.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="text-slate-500 group-hover:text-blue-400 transition-colors text-sm">
                        View Details →
                    </div>
                </div>
            ))}
        </div>
    );
};

export default IncidentList;
