import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { ArrowLeft, TrendingUp, TrendingDown, Layers, AlertTriangle } from 'lucide-react';

const LearnStrategy = ({ onBack }) => {
    return (
        <div className="min-h-screen bg-dark-900 text-white selection:bg-indigo-500/30">
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px] mix-blend-screen" />
            </div>

            <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
                {/* Header */}
                <div className="mb-12">
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to Home
                    </button>
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        The <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">EMA Strategy</span> Guide
                    </h1>
                    <p className="text-xl text-gray-400">
                        A systematic approach to capturing high-probability trend moves.
                    </p>
                </div>

                {/* Section 1: Core Concept */}
                <Section title="The Philosophy" icon={<Layers className="w-6 h-6 text-indigo-400" />}>
                    <p className="text-gray-300 mb-4 leading-relaxed">
                        Markets trend. We don't predict; we react. By aligning Exponential Moving Averages (EMAs) across multiple timeframes, we identify where the "smart money" is pushing the price. Our strategy relies on the confluence of four specific EMAs:
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <EmaCard value="9" label="Fast Momentum" color="text-cyan-400" />
                        <EmaCard value="21" label="Short-term Trend" color="text-emerald-400" />
                        <EmaCard value="55" label="Medium Trend" color="text-yellow-400" />
                        <EmaCard value="200" label="Long-term Bias" color="text-rose-400" />
                    </div>
                </Section>

                {/* Section 2: The Setup */}
                <Section title="The Perfect Setup" icon={<TrendingUp className="w-6 h-6 text-emerald-400" />}>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-emerald-400 mb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" /> Bullish (Long)
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-2"><span className="text-emerald-500 font-bold">1.</span> Price is ABOVE the 200 EMA (Trend is Up).</li>
                                <li className="flex gap-2"><span className="text-emerald-500 font-bold">2.</span> EMA 9 {'>'} EMA 21 {'>'} EMA 55 (Fan Shape).</li>
                                <li className="flex gap-2"><span className="text-emerald-500 font-bold">3.</span> Pullback: Price dips into the 21-55 EMA zone.</li>
                                <li className="flex gap-2"><span className="text-emerald-500 font-bold">4.</span> Trigger: Price closes back above the 9 EMA.</li>
                            </ul>
                        </div>
                        <div className="bg-white/5 border border-white/5 rounded-xl p-6">
                            <h3 className="text-xl font-bold text-rose-400 mb-2 flex items-center gap-2">
                                <TrendingDown className="w-5 h-5" /> Bearish (Short)
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-300">
                                <li className="flex gap-2"><span className="text-rose-500 font-bold">1.</span> Price is BELOW the 200 EMA (Trend is Down).</li>
                                <li className="flex gap-2"><span className="text-rose-500 font-bold">2.</span> EMA 9 {'<'} EMA 21 {'<'} EMA 55 (Fan Shape).</li>
                                <li className="flex gap-2"><span className="text-rose-500 font-bold">3.</span> Pullback: Price rallies into the 21-55 EMA zone.</li>
                                <li className="flex gap-2"><span className="text-rose-500 font-bold">4.</span> Trigger: Price closes back below the 9 EMA.</li>
                            </ul>
                        </div>
                    </div>
                </Section>

                {/* Section 3: Risk Management */}
                <Section title="Risk Management" icon={<AlertTriangle className="w-6 h-6 text-yellow-400" />}>
                    <p className="text-gray-300 mb-4">
                        A good strategy without risk management is gambling. This scanner helps you identify setups, but you must execute with discipline.
                    </p>
                    <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-l-4 border-yellow-500 p-4">
                        <h4 className="font-bold text-yellow-500 mb-1">Golden Rules</h4>
                        <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                            <li>Risk only 1-2% of your capital per trade.</li>
                            <li>Stop Loss should be placed below the recent swing low (Longs) or above swing high (Shorts).</li>
                            <li>Target a Risk:Reward ratio of at least 1:2.</li>
                        </ul>
                    </div>
                </Section>

                {/* Footer */}
                <div className="mt-12 text-center">
                    <button
                        onClick={onBack}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full font-medium transition-all"
                    >
                        Ready? Go to Home
                    </button>
                </div>
            </div>
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
            <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                {icon}
            </div>
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        {children}
    </motion.section>
);

const EmaCard = ({ value, label, color }) => (
    <div className="bg-dark-800 p-4 rounded-xl border border-white/5 text-center">
        <div className={`text-2xl font-bold ${color} mb-1`}>EMA {value}</div>
        <div className="text-xs text-gray-500 uppercase tracking-wider">{label}</div>
    </div>
);

LearnStrategy.propTypes = {
    onBack: PropTypes.func.isRequired,
};

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

export default LearnStrategy;
