import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className, ...props }) => {
    const baseStyles = "px-4 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
        primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
        secondary: "bg-slate-700 hover:bg-slate-600 text-white",
        outline: "border border-slate-600 hover:bg-slate-800 text-slate-300 hover:text-white",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20",
        ghost: "text-slate-400 hover:text-white hover:bg-white/5",
    };

    return (
        <motion.button
            whileTap={{ scale: 0.98 }}
            className={`${baseStyles} ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default Button;
