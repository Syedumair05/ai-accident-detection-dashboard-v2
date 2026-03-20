import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Check } from 'lucide-react';
import Button from '../ui/Button';
import Checkbox from '../ui/Checkbox';

const MultiDispatchModal = ({ alert, onClose }) => {
    const [selectedServices, setSelectedServices] = useState({
        Ambulance: true,
        Police: true,
        Fire: false,
        Traffic: false
    });
    const [isDispatched, setIsDispatched] = useState(false);

    const toggleService = (service) => {
        setSelectedServices(prev => ({ ...prev, [service]: !prev[service] }));
    };

    const handleDispatch = () => {
        setIsDispatched(true);
        setTimeout(onClose, 1500);
    };

    if (isDispatched) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                <motion.div
                    initial={{ scale: 0.9 }} animate={{ scale: 1 }}
                    className="relative bg-slate-900 border border-white/10 rounded-xl p-8 text-center max-w-sm w-full"
                >
                    <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-white">Services Notified</h3>
                    <p className="text-slate-400 mt-1">Coordination channel opening...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-slate-800/50">
                    <h3 className="text-lg font-semibold text-white">Multiple Dispatch</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                </div>

                <div className="p-6">
                    <p className="text-slate-400 text-sm mb-4">Select services to deploy for Incident <span className="text-white font-mono">{alert.id}</span>:</p>

                    <div className="space-y-3 bg-slate-950/50 p-4 rounded-lg border border-white/5">
                        <Checkbox
                            id="svc-ambulance"
                            label="Ambulance"
                            checked={selectedServices.Ambulance}
                            onChange={() => toggleService('Ambulance')}
                        />
                        <Checkbox
                            id="svc-police"
                            label="Police"
                            checked={selectedServices.Police}
                            onChange={() => toggleService('Police')}
                        />
                        <Checkbox
                            id="svc-fire"
                            label="Fire Brigade"
                            checked={selectedServices.Fire}
                            onChange={() => toggleService('Fire')}
                        />
                        <Checkbox
                            id="svc-traffic"
                            label="Traffic Management"
                            checked={selectedServices.Traffic}
                            onChange={() => toggleService('Traffic')}
                        />
                    </div>
                </div>

                <div className="p-4 border-t border-white/10 flex items-center justify-between bg-slate-800/30">
                    <span className="text-xs text-slate-500">
                        {Object.values(selectedServices).filter(Boolean).length} Selected
                    </span>
                    <Button onClick={handleDispatch} className="px-6">DISPATCH SELECTED</Button>
                </div>
            </motion.div>
        </div>
    );
};

export default MultiDispatchModal;
