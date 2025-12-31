import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import ThemeToggle from './ThemeToggle';
import { MousePointer2, TrendingUp, ShieldCheck, Activity, ArrowRight } from 'lucide-react';

// ... animations ...
const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    initial: {},
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

function StepCard({ icon, title, description, delay }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.5 }}
            className="glass-card p-6 hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-500/20"
        >
            <div className="mb-4 bg-indigo-50/50 dark:bg-dark-800/80 w-14 h-14 rounded-2xl flex items-center justify-center border border-indigo-100 dark:border-white/10 shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{title}</h3>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">{description}</p>
        </motion.div>
    );
}

StepCard.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    delay: PropTypes.number.isRequired,
};

function LandingPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#050505] text-slate-900 dark:text-white overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500">
            {/* Background Gradients (Aurora) */}
            <div className="fixed inset-0 z-0 pointer-events-none aurora-bg opacity-60 dark:opacity-40 animate-pulse-slow will-change-transform" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 py-12 lg:py-20">

                {/* Navbar Placeholder */}
                <nav className="flex justify-between items-center mb-20">
                    <Logo />
                    <ThemeToggle />
                </nav>

                {/* Hero Section */}
                <motion.div
                    initial="initial"
                    animate="animate"
                    variants={staggerContainer}
                    className="text-center max-w-4xl mx-auto mb-32"
                >
                    <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-8">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                        </span>
                        Live Market Analysis
                    </motion.div>

                    <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                        Master the Trend with <br />
                        <span className="text-gradient-premium drop-shadow-sm">
                            Precision EMA Strategy
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl text-slate-700 dark:text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Stop guessing. Start trading with a proven algorithmic approach.
                        Identify high-probability setups using multi-timeframe Exponential Moving Average alignment.
                    </motion.p>

                    <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button
                            onClick={() => navigate('/scanner')}
                            className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 flex items-center justify-between gap-3 overflow-hidden text-milky"
                        >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                            Start Scanning Now
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                        <button
                            onClick={() => navigate('/learn')}
                            className="px-8 py-4 bg-white/80 dark:bg-white/5 hover:bg-white dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl font-bold text-lg text-slate-700 dark:text-milky transition-all shadow-sm hover:shadow-md"
                        >
                            Learn the Strategy
                        </button>
                    </motion.div>
                </motion.div>

                {/* Features / Strategy Section */}
                <div className="grid md:grid-cols-3 gap-8 mb-32">
                    <StepCard
                        icon={<Activity className="w-8 h-8 text-blue-400" />}
                        title="The EMA Ribbon"
                        description="We track the 21, 50, and 100 EMAs. When they fan out in perfect order, it signals a powerful trend is underway."
                        delay={0.2}
                    />
                    <StepCard
                        icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
                        title="Multi-Timeframe"
                        description="True confirmation comes when the 4H, 1H, and 15m timeframes align. We filter out the noise so you don't have to."
                        delay={0.4}
                    />
                    <StepCard
                        icon={<MousePointer2 className="w-8 h-8 text-pink-400" />}
                        title="Sniper Entries"
                        description="Wait for the pullback. Our scanner identifies when price tests the EMA zones, giving you the perfect entry R:R."
                        delay={0.6}
                    />
                </div>

                {/* Visual Strategy Explainer */}
                <div className="bg-gradient-to-b from-dark-800/50 to-dark-900/50 rounded-3xl p-8 md:p-12 border border-white/5 mb-20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Why EMA Alignment Works</h2>
                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-indigo-500/20 flex items-center justify-center shrink-0">
                                        <span className="font-mono font-bold text-indigo-400">01</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Institutional Momentum</h3>
                                        <p className="text-slate-600 dark:text-gray-400">Large institutions trade with the trend. The 200 EMA acts as the "line in the sand" for long-term bias.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <span className="font-mono font-bold text-purple-400">02</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Dynamic Support</h3>
                                        <p className="text-slate-600 dark:text-gray-400">In strong trends, the 21 and 55 EMAs act as dynamic support zones where buyers step back in.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Abstract Chart Visualization */}
                        <div className="relative h-64 md:h-80 bg-black/40 rounded-xl border border-white/10 p-6 flex items-end justify-center overflow-hidden">
                            {/* Decorative Lines showing an uptrend */}
                            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
                                <path d="M0,300 C100,280 200,250 300,100 C400,50 600,20 800,0" stroke="rgba(99, 102, 241, 0.5)" strokeWidth="4" fill="none" />
                                <path d="M0,320 C100,300 200,280 300,150 C400,100 600,60 800,40" stroke="rgba(168, 85, 247, 0.5)" strokeWidth="4" fill="none" />
                                <path d="M0,340 C100,320 200,310 300,200 C400,150 600,100 800,80" stroke="rgba(236, 72, 153, 0.3)" strokeWidth="4" fill="none" />
                            </svg>

                            {/* Candles (Abstract) */}
                            <div className="absolute inset-x-12 bottom-12 flex items-end justify-between opacity-50">
                                <div className="w-4 h-20 bg-green-500/80 rounded-sm"></div>
                                <div className="w-4 h-32 bg-green-500/80 rounded-sm mb-4"></div>
                                <div className="w-4 h-16 bg-red-500/80 rounded-sm mb-8"></div>
                                <div className="w-4 h-40 bg-green-500/80 rounded-sm mb-12"></div>
                                <div className="w-4 h-24 bg-green-500/80 rounded-sm mb-20"></div>
                            </div>

                            <div className="z-10 bg-white/10 dark:bg-dark-900/80 backdrop-blur border border-white/20 dark:border-white/10 px-4 py-2 rounded-lg mb-8 shadow-lg">
                                <span className="flex items-center gap-2 text-green-600 dark:text-green-400 font-mono text-sm font-bold">
                                    <TrendingUp className="w-4 h-4" /> Strong Uptrend Detected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <footer className="text-center text-slate-500 dark:text-gray-500 py-12 border-t border-slate-200 dark:border-white/5 glass-card rounded-none border-x-0 border-b-0 mt-32">
                    <p className="text-xl font-bold text-slate-900 dark:text-white mb-2">Algo Signal Pulse</p>
                    <p className="mb-4">&copy; {new Date().getFullYear()} Educational Tool. All rights reserved.</p>
                    <div className="max-w-2xl mx-auto p-4 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] leading-relaxed">
                        <span className="font-bold text-red-400">DISCLAIMER:</span> This website is for <strong>EDUCATIONAL PURPOSES ONLY</strong>.
                        It provides technical analysis based on algorithms, which cannot predict the future.
                        Trading cryptocurrencies involves significant risk and can result in the loss of your capital.
                        We are not financial advisors. Trade at your own risk.
                    </div>
                </footer>

            </div>
        </div>
    );
}

export default LandingPage;
