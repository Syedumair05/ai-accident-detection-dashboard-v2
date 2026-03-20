import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ title, value, subtext, icon: Icon, color = "blue", delay = 0 }) => {
    const colorStyles = {
        red: "bg-red-500/10 text-red-500 border-red-500/20",
        orange: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        emerald: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        blue: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        slate: "bg-slate-800/50 text-slate-400 border-slate-700/50",
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            className={`p-5 rounded-xl border backdrop-blur-sm relative overflow-hidden ${colorStyles[color]}`}
        >
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs font-medium uppercase tracking-wider opacity-80 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-white">{value}</h3>
                    {subtext && <p className="text-xs mt-1 opacity-70">{subtext}</p>}
                </div>
                {Icon && <Icon className={`h-6 w-6 opacity-80`} />}
            </div>
        </motion.div>
    );
};

export default MetricCard;
