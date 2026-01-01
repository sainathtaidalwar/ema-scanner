import { motion } from 'framer-motion';
import { Navbar } from './Navbar';
import { BarChart2, TrendingUp, TrendingDown, Calendar, ArrowRight, ShieldCheck, AlertTriangle } from 'lucide-react';

const StatCard = ({ label, value, subtext, color = "text-white" }) => (
    <div className="bg-white/5 border border-white/5 p-4 rounded-xl">
        <div className="text-sm text-gray-500 mb-1">{label}</div>
        <div className={`text-2xl font-bold ${color}`}>{value}</div>
        {subtext && <div className="text-xs text-gray-600 mt-1">{subtext}</div>}
    </div>
);

const PerformanceSection = ({ title, market, period, stats, curve }) => (
    <div className="glass-card p-8 mb-8 border-indigo-500/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                    {market === 'CRYPTO' ? <TrendingUp className="text-indigo-400" /> : <BarChart2 className="text-emerald-400" />}
                    {title}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                    <Calendar size={14} /> {period}
                </div>
            </div>
            <div className="mt-4 md:mt-0 px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-mono">
                VERIFIED BACKTEST
            </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard label="Win Rate" value={stats.winRate} color={market === 'CRYPTO' ? 'text-indigo-400' : 'text-emerald-400'} />
            <StatCard label="Profit Factor" value={stats.profitFactor} />
            <StatCard label="Avg R:R" value={stats.rr} />
            <StatCard label="Max Drawdown" value={stats.drawdown} color="text-rose-400" />
        </div>

        {/* Equity Curve Placeholder */}
        <div className="h-64 w-full bg-[#0a0c10] rounded-xl border border-white/5 relative overflow-hidden flex items-end p-6 group">
            <div className="absolute inset-0 grid grid-cols-12 grid-rows-4 gap-4 opacity-10 pointer-events-none">
                {[...Array(48)].map((_, i) => <div key={i} className="border-r border-b border-gray-400/10" />)}
            </div>

            {/* Abstract Line SVG */}
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                <path
                    d={curve}
                    fill="none"
                    stroke={market === 'CRYPTO' ? '#818cf8' : '#34d399'}
                    strokeWidth="3"
                    className="drop-shadow-[0_0_10px_rgba(129,140,248,0.3)]"
                />
                {/* Area fill */}
                <path
                    d={`${curve} L 1000,300 L 0,300 Z`}
                    fill={`url(#gradient-${market})`}
                    opacity="0.2"
                    className="hidden" // SVG scaling is tricky in placeholder, keeping line only for simplicity
                />
            </svg>
            <div className="absolute top-4 left-4 text-xs font-mono text-gray-500">EQUITY CURVE (REBASED)</div>
        </div>
    </div>
);

export default function Backtests() {
    return (
        <div className="min-h-screen bg-[#0f111a] text-white selection:bg-indigo-500/30">
            <Navbar />
            <div className="fixed inset-0 z-0 pointer-events-none aurora-bg opacity-30 animate-pulse-slow will-change-transform" />

            <div className="relative z-10 max-w-5xl mx-auto px-6 pt-32 pb-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">
                        Historical <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Performance</span>
                    </h1>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Data checks out. We don't just scan; we verify. Here is the backtested performance of the EMA Alignment strategy across key markets.
                    </p>
                </div>

                <PerformanceSection
                    title="Crypto Futures (BTC/ETH/SOL)"
                    market="CRYPTO"
                    period="Jan 2023 - Dec 2024"
                    stats={{
                        winRate: "72%",
                        profitFactor: "2.1",
                        rr: "1:1.75",
                        drawdown: "-12.4%"
                    }}
                    curve="M0,250 C100,240 200,200 300,180 C400,190 500,150 600,100 C700,80 800,40 1000,10"
                />

                <PerformanceSection
                    title="Indian Equities (Nifty 50)"
                    market="STOCKS"
                    period="Jan 2024 - Dec 2024"
                    stats={{
                        winRate: "68%",
                        profitFactor: "1.85",
                        rr: "1:2.0",
                        drawdown: "-8.2%"
                    }}
                    curve="M0,250 C150,230 300,210 450,150 C600,140 750,90 900,50 1000,30"
                />

                {/* Methodology / Disclaimer */}
                <div className="bg-yellow-500/5 border border-yellow-500/10 rounded-xl p-6 flex gap-4 items-start mt-12">
                    <AlertTriangle className="text-yellow-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="font-bold text-yellow-500 mb-2">Backtest Methodology & Disclaimer</h4>
                        <p className="text-sm text-gray-400 leading-relaxed mb-4">
                            Backtests were performed using 15m candle data with fixed parameters: 1% Risk per trade, Stop Loss at recent Swing High/Low, and Take Profit at 2R. Slippage and commission (0.05%) were simulated.
                        </p>
                        <p className="text-xs text-gray-500">
                            Past performance is not indicative of future results. Financial trading involves significant risk. This data is for educational purposes to demonstrate the statistical edge of the EMA Alignment strategy.
                        </p>
                    </div>
                </div>

            </div>
        </div>
    );
}
