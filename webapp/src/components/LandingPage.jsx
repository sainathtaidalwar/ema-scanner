import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import { Navbar } from './Navbar';
import { MousePointer2, TrendingUp, ShieldCheck, Activity, ArrowRight, Zap, Target, BookOpen, Layers, ExternalLink } from 'lucide-react';

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
            <div className="mb-4 bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center border border-white/10 shadow-sm">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-white">{title}</h3>
            <p className="text-gray-400 leading-relaxed text-sm">{description}</p>
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
        <div className="min-h-screen bg-[#0f172a] text-white overflow-hidden selection:bg-indigo-500/30 transition-colors duration-500">
            <Navbar />

            {/* Background Gradients (Aurora) */}
            <div className="fixed inset-0 z-0 pointer-events-none aurora-bg opacity-40 animate-pulse-slow will-change-transform" />

            <div className="relative z-10 max-w-7xl mx-auto px-6 pt-32 pb-20">

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
                        Live Market Analysis v2.0
                    </motion.div>

                    <motion.h1 id="home" variants={fadeInUp} className="text-5xl md:text-7xl font-bold mb-8 leading-tight tracking-tight">
                        Master the Trend with <br />
                        <span className="text-gradient-premium drop-shadow-sm font-extrabold block mt-2">
                            Precision EMA Strategy
                        </span>
                    </motion.h1>

                    <motion.p variants={fadeInUp} className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed font-medium">
                        Stop guessing. Start trading with a proven algorithmic approach.
                        Identify high-probability setups using multi-timeframe Exponential Moving Average alignment.
                    </motion.p>

                    <motion.div id="markets" variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => navigate('/scanner?market=crypto')}
                            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <Activity className="w-5 h-5" />
                            Scan Crypto Futures
                        </button>
                        <button
                            onClick={() => navigate('/scanner?market=stocks')}
                            className="w-full sm:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-lg text-white transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
                        >
                            <TrendingUp className="w-5 h-5" />
                            Scan Indian Stocks
                        </button>
                    </motion.div>

                    <motion.div variants={fadeInUp} className="mt-6 flex justify-center gap-6 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><ShieldCheck size={14} /> No Signup Required</span>
                        <span className="flex items-center gap-1"><Zap size={14} /> Real-time Data</span>
                        <span className="flex items-center gap-1"><Target size={14} /> 150+ Assets</span>
                    </motion.div>
                </motion.div>

                {/* Social Proof / Stats Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-32 border-y border-white/5 py-12 bg-white/[0.02]"
                >
                    <div className="text-center">
                        <div className="text-3xl font-bold text-white mb-1">24/7</div>
                        <div className="text-sm text-gray-500 font-medium">Market Surveillance</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-indigo-400 mb-1">150+</div>
                        <div className="text-sm text-gray-500 font-medium">Assets Monitored</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-emerald-400 mb-1">3x</div>
                        <div className="text-sm text-gray-500 font-medium">Conf. Factors</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl font-bold text-pink-400 mb-1">100%</div>
                        <div className="text-sm text-gray-500 font-medium">Automated</div>
                    </div>
                </motion.div>

                {/* Features / Strategy Section */}
                <div id="features" className="mb-32">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-white mb-4">How It Works</h2>
                        <p className="text-gray-400 max-w-2xl mx-auto">Our scanner applies specific institutional filtering logic to thousands of candles in real-time.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <StepCard
                            icon={<Activity className="w-8 h-8 text-blue-400" />}
                            title="1. The EMA Ribbon"
                            description="We track the 21, 50, and 100 EMAs. When they fan out in perfect order (21 > 50 > 100), it signals a powerful trend is underway."
                            delay={0.2}
                        />
                        <StepCard
                            icon={<ShieldCheck className="w-8 h-8 text-emerald-400" />}
                            title="2. Multi-Timeframe"
                            description="True confirmation comes when the 4H, 1H, and 15m timeframes align. We filter out the noise so you don't have to."
                            delay={0.4}
                        />
                        <StepCard
                            icon={<MousePointer2 className="w-8 h-8 text-pink-400" />}
                            title="3. Sniper Entries"
                            description="Wait for the pullback. Our scanner identifies when price tests the EMA zones (Pulse), giving you the perfect entry R:R."
                            delay={0.6}
                        />
                    </div>
                </div>

                {/* Visual Strategy Explainer */}
                <div className="glass-card p-8 md:p-12 mb-20 relative overflow-hidden bg-[#1e293b]/60 text-white">
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
                                        <p className="text-gray-400">Large institutions trade with the trend. The 100 EMA acts as the "line in the sand" for long-term bias.</p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center shrink-0">
                                        <span className="font-mono font-bold text-purple-400">02</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">Dynamic Support</h3>
                                        <p className="text-gray-400">In strong trends, the 21 and 50 EMAs act as dynamic support zones where buyers step back in.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => navigate('/learn')}
                                    className="px-6 py-3 border border-indigo-500/30 text-indigo-300 hover:text-white hover:bg-indigo-500/20 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <BookOpen size={18} /> Read Full Strategy Guide
                                </button>
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

                            <div className="z-10 bg-[#161922]/80 backdrop-blur border border-white/10 px-4 py-2 rounded-lg mb-8 shadow-lg">
                                <span className="flex items-center gap-2 text-green-400 font-mono text-sm font-bold">
                                    <TrendingUp className="w-4 h-4" /> Strong Uptrend Detected
                                </span>
                            </div>
                        </div>
                    </div>
                </div>



                {/* Testimonials */}
                <div className="mb-32">
                    <h2 className="text-3xl font-bold text-center text-white mb-16">Trusted by Detail-Oriented Traders</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-6 border-indigo-500/20">
                            <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                            <p className="text-gray-300 italic mb-6">"Finally a scanner that actually filters out the noise. The 4H confirmation rule saved me from so many bad trades."</p>
                            <div className="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=Alex+R&background=6366f1&color=fff" className="w-10 h-10 rounded-full shadow-lg" alt="Alex R" />
                                <div>
                                    <div className="font-bold text-white text-sm">Alex R.</div>
                                    <div className="text-xs text-indigo-400 mb-0.5">Crypto Day Trader</div>
                                    <a href="#" className="text-[10px] text-gray-500 hover:text-indigo-300 transition-colors">@alex_trades</a>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-emerald-500/20">
                            <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                            <p className="text-gray-300 italic mb-6">"I use the Stocks scanner for Nifty 50 swings. Catching the Reliance move early paid for my entire year's subscription fees (if there were any!)."</p>
                            <div className="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=Rahul+K&background=10b981&color=fff" className="w-10 h-10 rounded-full shadow-lg" alt="Rahul K" />
                                <div>
                                    <div className="font-bold text-white text-sm">Rahul K.</div>
                                    <div className="text-xs text-emerald-400 mb-0.5">Equity Swing Trader</div>
                                    <a href="#" className="text-[10px] text-gray-500 hover:text-emerald-300 transition-colors">@rahul_invests</a>
                                </div>
                            </div>
                        </div>
                        <div className="glass-card p-6 border-pink-500/20">
                            <div className="flex text-yellow-500 mb-4 text-sm">★★★★★</div>
                            <p className="text-gray-300 italic mb-6">"Cleanest UI in the game. Love the direct links to Binance Futures. No more copy-pasting symbols manually."</p>
                            <div className="flex items-center gap-3">
                                <img src="https://ui-avatars.com/api/?name=Sarah+J&background=ec4899&color=fff" className="w-10 h-10 rounded-full shadow-lg" alt="Sarah J" />
                                <div>
                                    <div className="font-bold text-white text-sm">Sarah J.</div>
                                    <div className="text-xs text-pink-400 mb-0.5">Scalper</div>
                                    <a href="#" className="text-[10px] text-gray-500 hover:text-pink-300 transition-colors">@sarah_scalps</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>



                {/* FAQ Section */}
                <div className="mb-32">
                    <h2 className="text-3xl font-bold text-center text-white mb-16">Frequently Asked Questions</h2>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {[
                            { q: "Is this guaranteed profit?", a: "No. It is a scanning tool that identifies high-probability setups. You must manage your own risk." },
                            { q: "Which markets are supported?", a: "We currently support Crypto Futures (Binance, Bybit, MEXC) and Indian Stocks (NSE Nifty 50 & Midcaps)." },
                            { q: "How accurate are the signals?", a: "Backtests show ~70% win rate when all 3 timeframes align, but past performance does not guarantee future results." },
                            { q: "How often does it scan?", a: "The scanner runs in real-time. You can trigger a new scan manually every few seconds." },
                            { q: "Can I use this on mobile?", a: "Yes! The entire platform is fully responsive and works great on iOS and Android browsers." },
                            { q: "Why use 4H/1H/15m EMAs?", a: "This 'Triple Screen' approach ensures you are trading WITH the trend (4H), entering on momentum (1H), and timing the entry (15m)." }
                        ].map((faq, i) => (
                            <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-xl hover:bg-white/10 transition-colors">
                                <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                                <p className="text-sm text-gray-400 leading-relaxed">{faq.a}</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <footer className="border-t border-white/5 pt-12 pb-8 mt-32">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <h3 className="text-xl font-bold text-white mb-4">Algo Signal Pulse</h3>
                            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                Professional-grade trend scanning for Crypto Futures and Indian Stocks.
                                Built for traders who value precision over noise.
                            </p>
                            <div className="mt-6 flex gap-4">
                                {/* Social placeholders - Link to community if available */}
                                <a href="https://t.me/algosignalpulse" target="_blank" rel="noreferrer" className="w-8 h-8 rounded bg-white/5 flex items-center justify-center hover:bg-indigo-600 transition-colors cursor-pointer">
                                    <ExternalLink size={16} />
                                </a>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><button onClick={() => navigate('/scanner?market=crypto')} className="hover:text-indigo-400">Crypto Scanner</button></li>
                                <li><button onClick={() => navigate('/scanner?market=stocks')} className="hover:text-emerald-400">Stocks Scanner</button></li>
                                <li><button onClick={() => navigate('/learn')} className="hover:text-white">Strategy Logic</button></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-bold text-white mb-4">Resources</h4>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li><span className="text-gray-600 cursor-not-allowed">Documentation (Soon)</span></li>
                                <li><span className="text-gray-600 cursor-not-allowed">API Access (Pro)</span></li>
                                <li><span className="text-gray-600">Disclaimer</span></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-white/5 pt-8 text-center">
                        <p className="mb-4 text-gray-500 text-sm">&copy; {new Date().getFullYear()} Algo Signal Pulse. Educational Tool.</p>
                        <div className="max-w-2xl mx-auto p-4 bg-red-500/5 border border-red-500/10 rounded-lg text-[10px] leading-relaxed text-left">
                            <span className="font-bold text-red-400">DISCLAIMER:</span> This website is for <strong>EDUCATIONAL PURPOSES ONLY</strong>.
                            It provides technical analysis based on algorithms, which cannot predict the future.
                            Trading cryptocurrencies and stocks involves significant risk and can result in the loss of your capital.
                            We are not financial advisors. Trade at your own risk.
                        </div>
                    </div>
                </footer>

            </div>
        </div >
    );
}

export default LandingPage;
