import React, { useState } from 'react';
import {
    AlertTriangle, MapPin, Camera, Clock, Cloud, Car, FileText, Download,
    ExternalLink, Siren, ShieldCheck, Truck, Construction, PhoneCall
} from 'lucide-react';
import Button from '../ui/Button';
import DispatchModal from '../modals/DispatchModal';
import MultiDispatchModal from '../modals/MultiDispatchModal';

const IncidentDetails = ({ alert }) => {
    const [showDispatchModal, setShowDispatchModal] = useState(null); // 'ambulance', 'police', etc.
    const [showMultiModal, setShowMultiModal] = useState(false);

    if (!alert) return <div className="p-6 text-slate-500 text-center">Select an alert to view details</div>;

    return (
        <div className="bg-slate-900 border-l border-white/10 w-96 flex-shrink-0 flex flex-col h-[calc(100vh-64px)] overflow-y-auto scrollbar-hide">

            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-10">
                <h2 className="text-white font-semibold text-sm tracking-wide">INCIDENT DETAILS</h2>
                <p className="text-xs text-slate-400 mt-1">ID: {alert.id} | Status: <span className="text-red-400">Analysis Complete</span></p>
            </div>

            <div className="p-4 space-y-6">

                {/* Severity Badge */}
                <div className="flex items-center justify-between">
                    <div className={`px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${alert.priority === 'critical' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                            'bg-orange-500/10 text-orange-400 border-orange-500/20'
                        }`}>
                        <div className={`w-2 h-2 rounded-full ${alert.priority === 'critical' ? 'bg-red-500 animate-pulse' : 'bg-orange-500'}`} />
                        {alert.priority} • 94% Confidence
                    </div>
                </div>

                {/* Primary Info */}
                <div className="space-y-3">
                    <InfoRow icon={MapPin} label="Location" value={alert.location} />
                    <InfoRow icon={Camera} label="Camera Source" value="CAM_001 (North East)" />
                    <InfoRow icon={Clock} label="Timestamp" value={alert.time} />
                    <InfoRow icon={Car} label="Objects Detected" value="Car, Pedestrian" />
                    <InfoRow icon={Cloud} label="Weather" value="Clear, Visibility 10km" />
                    <InfoRow icon={TrafficIcon} label="Traffic Flow" value="Heavy" />
                </div>

                {/* Video Evidence Section */}
                <div className="p-4 rounded-lg bg-slate-800/30 border border-white/5 space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <FileText size={12} /> Video Evidence
                    </h3>
                    <div className="space-y-2 text-xs">
                        <div className="flex justify-between text-slate-400"><span>Clip ID:</span> <span className="text-slate-200 font-mono">CLIP_2026_001</span></div>
                        <div className="flex justify-between text-slate-400"><span>Size:</span> <span className="text-slate-200">18.4 MB (MP4)</span></div>
                        <div className="flex justify-between text-slate-400"><span>Retention:</span> <span className="text-slate-200">90 Days</span></div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <Button variant="outline" className="text-xs py-2 h-8"><Download size={12} /> Download</Button>
                        <Button variant="outline" className="text-xs py-2 h-8"><ExternalLink size={12} /> Open File</Button>
                    </div>
                </div>

                {/* Dispatch Actions */}
                <div className="space-y-3 pt-2 border-t border-white/10">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Dispatch Services</h3>

                    <div className="grid grid-cols-2 gap-2">
                        <DispatchButton variant="danger" icon={Siren} label="Ambulance" onClick={() => setShowDispatchModal('Ambulance')} />
                        <DispatchButton variant="primary" icon={ShieldCheck} label="Police" onClick={() => setShowDispatchModal('Police')} />
                        <DispatchButton variant="orange" icon={Truck} label="Fire Brigade" onClick={() => setShowDispatchModal('Fire Brigade')} />
                        <DispatchButton variant="outline" icon={Construction} label="Traffic Mgmt" onClick={() => setShowDispatchModal('Traffic Management')} />
                    </div>
                    <Button variant="secondary" className="w-full" onClick={() => setShowMultiModal(true)}>
                        <PhoneCall size={16} /> Multiple Services
                    </Button>
                </div>

            </div>

            {/* Modals */}
            {showDispatchModal && (
                <DispatchModal
                    service={showDispatchModal}
                    alert={alert}
                    onClose={() => setShowDispatchModal(null)}
                />
            )}

            {showMultiModal && (
                <MultiDispatchModal
                    alert={alert}
                    onClose={() => setShowMultiModal(false)}
                />
            )}

        </div>
    );
};

const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-start gap-3 text-sm">
        <Icon size={16} className="text-slate-500 mt-0.5" />
        <div>
            <p className="text-slate-400 text-xs">{label}</p>
            <p className="text-slate-200 font-medium">{value}</p>
        </div>
    </div>
);

const TrafficIcon = ({ size, className }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M6.5 7H3m18 0h-3.5M6.5 17H3m18 0h-3.5M6 12h12" />
    </svg>
);

const DispatchButton = ({ variant, icon: Icon, label, onClick }) => {
    const styles = {
        danger: "bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20",
        primary: "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20",
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
        outline: "border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700/50"
    };

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center gap-1 p-3 rounded-lg border transition-all ${styles[variant === 'danger' ? 'danger' : variant === 'primary' ? 'primary' : variant === 'orange' ? 'orange' : 'outline']}`}
        >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
        </button>
    );
};

export default IncidentDetails;
