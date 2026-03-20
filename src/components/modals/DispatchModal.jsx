import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';

const DispatchModal = ({ service, alert, onClose }) => {
    const [isDispatched, setIsDispatched] = useState(false);
    const [notes, setNotes] = useState('');

    const handleConfirm = () => {
        // Simulate API call
        setTimeout(() => {
            setIsDispatched(true);
            setTimeout(onClose, 1500);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="relative bg-slate-900 border border-white/10 rounded-xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                {isDispatched ? (
                    <div className="p-8 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4"
                        >
                            <CheckCircle size={32} />
                        </motion.div>
                        <h3 className="text-xl font-bold text-white mb-1">Dispatch Confirmed</h3>
                        <p className="text-slate-400">Service {service} has been notified.</p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-800/50">
                            <h3 className="text-lg font-semibold text-white">Confirm Dispatch</h3>
                            <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 flex items-start gap-3">
                                <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={18} />
                                <div>
                                    <h4 className="text-sm font-bold text-red-400">Emergency Dispatch</h4>
                                    <p className="text-xs text-red-300/80">You are about to deploy emergency services. This action is logged.</p>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-300">
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Service:</span>
                                    <span className="font-bold text-white">{service}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Incident ID:</span>
                                    <span className="font-mono">{alert.id}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/5 pb-2">
                                    <span className="text-slate-500">Location:</span>
                                    <span>{alert.location}</span>
                                </div>
                                <div className="flex justify-between pb-2">
                                    <span className="text-slate-500">Severity:</span>
                                    <span className="text-red-500 font-bold uppercase">{alert.priority} 🔴</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-slate-400 mb-1">Notes (optional)</label>
                                <textarea
                                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none"
                                    rows={3}
                                    placeholder="Add dispatch instructions..."
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-800/50 border-t border-white/10 flex gap-3 justify-end">
                            <Button variant="ghost" onClick={onClose} className="text-sm">Cancel</Button>
                            <Button variant="danger" onClick={handleConfirm} className="text-sm">
                                CONFIRM DISPATCH
                            </Button>
                        </div>
                    </>
                )}
            </motion.div>
        </div>
    );
};

export default DispatchModal;
