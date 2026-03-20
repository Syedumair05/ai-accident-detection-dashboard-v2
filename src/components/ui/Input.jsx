import React from 'react';

const Input = ({ icon: Icon, className, ...props }) => {
    return (
        <div className="relative group">
            {Icon && (
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-400 transition-colors">
                    <Icon size={20} />
                </div>
            )}
            <input
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg py-3 ${Icon ? 'pl-10' : 'pl-4'
                    } pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
