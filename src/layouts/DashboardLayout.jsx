import React from 'react';
import Header from '../components/Header';

const DashboardLayout = ({ children }) => {
    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-blue-500/30">
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-900/20 via-slate-950 to-black pointer-events-none z-0" />
            <div className="relative z-10 flex flex-col h-screen overflow-hidden">
                <Header />
                <main className="flex-1 overflow-auto p-6 scrollbar-hide">
                    <div className="max-w-7xl mx-auto space-y-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
