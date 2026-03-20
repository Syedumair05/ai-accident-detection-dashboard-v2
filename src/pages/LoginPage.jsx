import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, User, Lock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Checkbox from '../components/ui/Checkbox';
import Login from '../components/auth/Login';

const LoginPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            setIsLoading(false);
            navigate('/dashboard');
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black z-0" />
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 z-0 pointer-events-none" />
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 w-full max-w-md"
            >
                <div className="glass-panel p-8 rounded-2xl border border-white/5 shadow-2xl backdrop-blur-xl bg-slate-900/60">

                    {/* Header */}
                    <div className="text-center mb-8">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-xl mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20 mb-4"
                        >
                            <ShieldAlert className="text-white w-8 h-8" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-2xl font-bold text-white tracking-tight"
                        >
                            AI Accident Detection
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-400 text-sm mt-1 uppercase tracking-wider font-medium"
                        >
                            Operator Console
                        </motion.p>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleLogin} className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Operator ID / Email</label>
                            <Input
                                icon={User}
                                type="email"
                                placeholder="operator@system.com"
                                required
                                autoComplete="email"
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                        >
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                            <Input
                                icon={Lock}
                                type="password"
                                placeholder="••••••••••••"
                                required
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                            className="flex items-center justify-between"
                        >
                            <Checkbox id="remember" label="Remember this device" />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <Button
                                type="submit"
                                className="w-full justify-center py-3.5 text-lg"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <span className="flex items-center gap-2">
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Verifying...
                                    </span>
                                ) : (
                                    <>
                                        LOGIN <ArrowRight size={18} />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    </form>

                    <div className="mt-6 flex items-center justify-center">
                        <div className="border-t border-slate-700 w-full"></div>
                        <span className="px-3 text-slate-500 text-sm">Or</span>
                        <div className="border-t border-slate-700 w-full"></div>
                    </div>

                    <div className="mt-6">
                        <Login
                            onLoginSuccess={(decoded) => {
                                console.log('Google Login Success:', decoded);
                                navigate('/dashboard');
                            }}
                            onLoginFailure={() => {
                                console.log('Google Login Failed');
                            }}
                        />
                    </div>

                    {/* Footer */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.9 }}
                        className="mt-8 text-center"
                    >
                        <a href="#" className="text-sm text-slate-500 hover:text-blue-400 transition-colors">
                            Forgot password?
                        </a>
                        <div className="mt-8 pt-6 border-t border-white/5">
                            <p className="text-xs text-slate-600 flex items-center justify-center gap-2">
                                <ShieldAlert size={12} />
                                Secure system • All actions are audited
                            </p>
                        </div>
                    </motion.div>

                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
