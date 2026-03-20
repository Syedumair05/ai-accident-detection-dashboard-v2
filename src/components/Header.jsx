import React from 'react';
import { Bell, Search, Menu, User, ShieldAlert, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

const Header = () => {
    return (
        <header className="h-16 border-b border-white/10 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 flex items-center justify-between">
            {/* Left: Logo & System Context */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                        <ShieldAlert className="text-white w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm tracking-wide">AI Accident Detection</h1>
                        <div className="flex items-center gap-2">
                            <span className="flex relative h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs text-emerald-400 font-medium tracking-wider">SYSTEM LIVE</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right: Actions & Profile */}
            <div className="flex items-center gap-6">

                {/* Alerts Notification */}
                <div className="relative cursor-pointer group">
                    <div className="p-2 rounded-full hover:bg-white/5 transition-colors text-slate-400 group-hover:text-white">
                        <Bell size={20} />
                    </div>
                    <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-[10px] font-bold text-white flex items-center justify-center rounded-full border-2 border-slate-900">
                        3
                    </span>
                </div>

                <div className="h-8 w-px bg-white/10" />

                {/* User Profile */}
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                        <p className="text-sm text-white font-medium">Faiz</p>
                        <p className="text-xs text-slate-400">Chief Operator</p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center text-slate-400 overflow-hidden">
                        <User size={20} />
                    </div>
                    <button className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
