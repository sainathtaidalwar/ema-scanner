import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, Layers, AlertTriangle } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const LearnStrategy = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f111a] text-slate-800 dark:text-white selection:bg-indigo-500/30 transition-colors duration-500">
            <div className="fixed inset-0 z-0 pointer-events-none aurora-bg opacity-40 dark:opacity-30 animate-pulse-slow will-change-transform" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex justify-between items-center mb-6">
                        <button
                            onClick={() => navigate('/')}
                            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            Back to Home
                        </button>
                        <ThemeToggle />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4 text-slate-900 dark:text-white">
                        The <span className="text-gradient-premium font-extrabold">Algo Signal Pulse</span> Strategy
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400">
                        A systematic approach to capturing high-probability trend moves.
                    </p>
                </div>

                {/* Section 1: Core Concept */}
                <Section title="The Philosophy" icon={<Layers className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />}>
                    <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                        Markets trend. We don't predict; we react. By aligning Exponential Moving Averages (EMAs) across multiple timeframes, we identify where the "smart money" is pushing the price. Our strategy relies on the confluence of three specific institutional EMAs:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                        <EmaCard value="21" label="Fast Pullback Support" color="text-cyan-400" />
                        <EmaCard value="50" label="Institutional Trend" color="text-indigo-400" />
                        <EmaCard value="100" label="Major Bias" color="text-purple-400" />
                    </div>
                </Section>

                {/* Section 1.5: Why We Are Different */}
                <Section title="Why We Are Different" icon={<div className="w-6 h-6 text-amber-500 dark:text-amber-400 font-bold text-center">★</div>}>
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-300">Institutional Logic</h3>
                            <p className="text-sm text-slate-600 dark:text-gray-400 leading-relaxed">
                                Most scanners look for random pumps. We strictly align with the <strong>21, 50, and 100 EMAs</strong>—the exact levels algorithmic funds use to define trends.
                            </p>
                        </div>
                        <div className="glass-card p-6">
                            <h3 className="font-bold text-lg mb-2 text-indigo-600 dark:text-indigo-300">Trend Alignment, Not Prediction</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                We never guess tops or bottoms. We wait for the <strong>4H and 1H trends to agree</strong> before signaling a 15m entry. This filters out 80% of false signals.
                            </p>
                        </div>
                    </div>
                </Section>

                {/* Section 2: The Setup */}
                <Section title="The Perfect Setup" icon={<TrendingUp className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />}>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/10 rounded-bl-full pointer-events-none" />
                            <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" /> Bullish (Long)
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-500 font-bold">1.</span> Price is ABOVE the 21 EMA (Momentum is Up).</li>
                                <li className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-500 font-bold">2.</span> EMA 21 {'>'} EMA 50 {'>'} EMA 100 (Fan Shape).</li>
                                <li className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-500 font-bold">3.</span> Trend Check: 4H and 1H must confirm bullish stack.</li>
                                <li className="flex gap-2"><span className="text-emerald-600 dark:text-emerald-500 font-bold">4.</span> Trigger: 15m Price holds above EMA 50 support.</li>
                                <li className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/10"><span className="text-yellow-600 dark:text-yellow-500 font-bold">★ Bonus:</span> ADX {'>'} 25 & RSI {'>'} 50 confirms strength.</li>
                            </ul>
                        </div>
                        <div className="glass-card p-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rounded-bl-full pointer-events-none" />
                            <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-2 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5" /> Bearish (Short)
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
                                <li className="flex gap-2"><span className="text-rose-600 dark:text-rose-500 font-bold">1.</span> Price is BELOW the 21 EMA (Momentum is Down).</li>
                                <li className="flex gap-2"><span className="text-rose-600 dark:text-rose-500 font-bold">2.</span> EMA 21 {'<'} EMA 50 {'<'} EMA 100 (Fan Shape).</li>
                                <li className="flex gap-2"><span className="text-rose-600 dark:text-rose-500 font-bold">3.</span> Trend Check: 4H and 1H must confirm bearish stack.</li>
                                <li className="flex gap-2"><span className="text-rose-600 dark:text-rose-500 font-bold">4.</span> Trigger: 15m Price held below EMA 50 resistance.</li>
                                <li className="flex gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-white/10"><span className="text-yellow-600 dark:text-yellow-500 font-bold">★ Bonus:</span> ADX {'>'} 25 & RSI {'<'} 50 confirms weakness.</li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Section 2.5: Supported Exchanges */}
                <Section title="Supported Exchanges" icon={<div className="w-6 h-6 text-blue-400 font-bold text-center">⇄</div>}>
                    <p className="text-gray-300 mb-6">
                        We scan the most liquid markets in crypto to ensure reliable execution.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <ExchangeCard name="Binance Futures" desc="Top Liquidity" color="text-yellow-400" border="border-yellow-500/20" />
                        <ExchangeCard name="Bybit Derivatives" desc="Best for Alts" color="text-orange-400" border="border-orange-500/20" />
                        <ExchangeCard name="MEXC Perpetuals" desc="High Leverage Gem Hunter" color="text-green-400" border="border-green-500/20" />
                    </div>
                </Section>

                {/* Section 3: Risk Management */}
                <Section title="Risk Management" icon={<AlertTriangle className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />}>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                        A good strategy without risk management is gambling. This scanner helps you identify setups, but you must execute with discipline.
                    </p>
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-4">
                        <h4 className="font-bold text-yellow-600 dark:text-yellow-500 mb-1">Golden Rules</h4>
                        <ul className="list-disc list-inside text-sm text-gray-700 dark:text-gray-300 space-y-1">
                            <li>Risk only 1-2% of your capital per trade.</li>
                            <li>Stop Loss should be placed below the recent swing low (Longs) or above swing high (Shorts).</li>
                            <li>Target a Risk:Reward ratio of at least 1:2.</li>
                        </ul>
                    </div>
                </Section>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <button
                        onClick={() => navigate('/')}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-medium transition-all"
                    >
                        Ready? Go to Home
                    </button>
                </div>
            </div>

            <footer className="text-center text-gray-500 dark:text-gray-500 text-sm border-t border-gray-200 dark:border-white/5 py-8 mt-12 transition-colors duration-200">
                <p className="mb-4">© {new Date().getFullYear()} Algo Signal Pulse. Educational Tool.</p>
                <div className="max-w-2xl mx-auto p-4 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] leading-relaxed">
                    <p className="font-bold text-red-600 dark:text-red-400 mb-1">EDUCATIONAL PURPOSE ONLY</p>
                    <p>
                        The strategies explained here are for theoretical understanding of technical analysis.
                        They represent model behaviors, not financial advice.
                        Trading involves real financial risk. You are solely responsible for your trades.
                    </p>
                </div>
            </footer>
        </div>
    );
};

const Section = ({ title, icon, children }) => (
    <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mb-16"
    >
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-white/5 rounded-lg border border-indigo-100 dark:border-white/10 shadow-sm">
                {icon}
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{title}</h2>
        </div>
        {children}
    </motion.section>
);

const EmaCard = ({ value, label, color }) => (
    <div className="glass-card p-4 text-center hover:-translate-y-1 transition-transform duration-300">
        <div className={`text-2xl font-bold ${color} mb-1 drop-shadow-sm`}>EMA {value}</div>
        <div className="text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
);

Section.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.element.isRequired,
    children: PropTypes.node.isRequired,
};

EmaCard.propTypes = {
    value: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
};

const ExchangeCard = ({ name, desc, color, border }) => (
    <div className={`glass-card p-4 text-center group hover:bg-white/60 dark:hover:bg-white/10`}>
        <div className={`text-lg font-bold ${color} mb-1 group-hover:scale-105 transition-transform drop-shadow-sm`}>{name}</div>
        <div className="text-xs text-slate-500 dark:text-gray-400">{desc}</div>
    </div>
);

ExchangeCard.propTypes = {
    name: PropTypes.string.isRequired,
    desc: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
};

export default LearnStrategy;
