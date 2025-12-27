import React from 'react';
import { motion } from 'framer-motion';

export const Logo = ({ className = "w-8 h-8", calm = false }) => {
    return (
        <div className={`flex items-center gap-3 select-none ${className}`}>
            <div className="relative w-10 h-10 flex items-center justify-center">
                {/* Background Glow */}
                <motion.div
                    className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 blur-md"
                    animate={calm ? {} : { opacity: [0.5, 0.8, 0.5] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                />

                {/* Logo Shape */}
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg overflow-visible">
                    <defs>
                        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#818cf8" /> {/* Indigo-400 */}
                            <stop offset="100%" stopColor="#c084fc" /> {/* Purple-400 */}
                        </linearGradient>
                    </defs>

                    {/* Abstract Polygon Base */}
                    <path
                        d="M20,50 L35,50 L45,30 L55,70 L65,50 L80,50"
                        fill="none"
                        stroke="url(#logoGradient)"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Pulse Dot */}
                    {!calm && (
                        <motion.circle
                            cx="20" cy="50" r="4" fill="#fff"
                            animate={{
                                cx: [20, 35, 45, 55, 65, 80],
                                cy: [50, 50, 30, 70, 50, 50],
                                opacity: [0, 1, 1, 1, 1, 0]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "linear",
                                times: [0, 0.25, 0.4, 0.5, 0.65, 1],
                                repeatDelay: 1
                            }}
                        />
                    )}
                </svg>
            </div>

            {/* Text */}
            <div className="flex flex-col">
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 tracking-tight">
                    Algo Signal Pulse
                </span>
            </div>
        </div>
    );
};
