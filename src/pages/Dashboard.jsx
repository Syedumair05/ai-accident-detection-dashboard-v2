import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Activity, Camera, ExternalLink } from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import MetricCard from '../components/dashboard/MetricCard';
import IncidentList from '../components/dashboard/IncidentList';
import Button from '../components/ui/Button';

const Dashboard = () => {
    const navigate = useNavigate();

    return (
        <DashboardLayout>
            {/* Top Row: System Status & Primary Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Active Incidents Summary */}
                <div className="lg:col-span-2 space-y-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Activity className="text-blue-400" size={20} />
                        Active Incidents Overview
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <MetricCard
                            title="Critical Incidents"
                            value="1"
                            icon={AlertTriangle}
                            color="red"
                            delay={0.1}
                        />
                        <MetricCard
                            title="High Priority"
                            value="2"
                            icon={AlertTriangle}
                            color="orange"
                            delay={0.2}
                        />
                        <MetricCard
                            title="Total Active"
                            value="5"
                            subtext="Across all zones"
                            color="slate"
                            delay={0.3}
                        />
                    </div>
                </div>

                {/* Action Card */}
                <div className="bg-gradient-to-br from-blue-600/20 to-slate-900/50 rounded-xl p-6 border border-blue-500/30 flex flex-col justify-center items-start backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-2">Operator Console</h3>
                    <p className="text-slate-300 text-sm mb-6">
                        Access the live monitoring interface to manage active alerts and coordinate dispatch.
                    </p>
                    <Button onClick={() => navigate('/console')} className="w-full">
                        Go to Live Dashboard <ExternalLink size={16} />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-2">
                {/* System Overview */}
                <div className="glass-panel rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Camera className="text-emerald-400" size={20} />
                        System Overview
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                            <p className="text-slate-400 text-xs uppercase font-medium">Cameras Active</p>
                            <p className="text-2xl font-bold text-emerald-400 mt-1">48 <span className="text-sm text-slate-500 font-normal">/ 50</span></p>
                        </div>
                        <div className="p-4 rounded-lg bg-slate-800/50 border border-white/5">
                            <p className="text-slate-400 text-xs uppercase font-medium">Cameras Offline</p>
                            <p className="text-2xl font-bold text-slate-300 mt-1">2</p>
                        </div>
                        <div className="col-span-2 p-4 rounded-lg bg-slate-800/50 border border-white/5">
                            <div className="flex justify-between items-center">
                                <p className="text-slate-400 text-xs uppercase font-medium">Last Incident Detected</p>
                                <span className="text-xs text-blue-400 font-mono">ID: ACC_001</span>
                            </div>
                            <p className="text-xl font-bold text-white mt-1">2 min ago</p>
                        </div>
                    </div>
                </div>

                {/* Recent Incidents */}
                <div className="glass-panel rounded-xl p-6 border border-white/5">
                    <h3 className="text-lg font-semibold text-white mb-4">Recent Activity (24h)</h3>
                    <IncidentList />
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
