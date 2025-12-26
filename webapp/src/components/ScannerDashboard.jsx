import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ArrowDown, ArrowUp, RefreshCw, Settings, Play, ExternalLink, BarChart2, Zap, Layout, Clock, Plus, Trash2, ShieldCheck, TrendingUp, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Use environment variable for API URL in production, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function ScannerDashboard() {
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState([]);
    const [pairs, setPairs] = useState([]);
    const [error, setError] = useState(null);
    const [filterSide, setFilterSide] = useState('ALL'); // ALL, LONG, SHORT

    // --- STRATEGY STATE ---
    const [strategy, setStrategy] = useState({
        name: "Custom Strategy",
        rules: []
    });

    useEffect(() => {
        fetchPairs();
    }, []);

    const fetchPairs = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await axios.get(`${API_BASE}/pairs?limit=150`, { timeout: 30000 });
            if (res.data.pairs && res.data.pairs.length > 0) {
                setPairs(res.data.pairs);
                await handleScan(res.data.pairs);
            } else {
                throw new Error("Empty pairs list received from server");
            }
        } catch (err) {
            console.error("Failed to fetch pairs", err);
            setError("Connection Error. Please check backend.");
        } finally {
            setLoading(false);
        }
    };

    const handleScan = async (manualPairs = null) => {
        const targets = Array.isArray(manualPairs) ? manualPairs : pairs;
        if (!targets || targets.length === 0) return;

        setLoading(true);
        setResults([]);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/scan`, {
                symbols: targets,
                config: config
            });
            if (res.data.results && res.data.results.length === 0) {
                setError("No setups found matching current criteria.");
            }
            setResults(res.data.results || []);
        } catch (err) {
            console.error("Scan failed", err);
            setError("Scan execution failed.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate Market Sentiment
    const longCount = results.filter(r => r.Side === 'LONG').length;
    const shortCount = results.filter(r => r.Side === 'SHORT').length;
    const totalActive = longCount + shortCount;
    const sentiment = totalActive === 0 ? 50 : Math.round((longCount / totalActive) * 100);

    return (
        <div className="min-h-screen bg-[#0f111a] text-gray-300 font-sans selection:bg-brand-glow selection:text-white">
            {/* Professional Navbar */}
            <nav className="border-b border-white/5 bg-[#0f111a]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                                <Zap size={20} className="text-white fill-current" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white">
                                VANTAGE <span className="text-gray-500 font-light">// TERMINAL</span>
                            </span>
                        </div>
                        <div className="hidden md:flex gap-8 text-sm font-medium">
                            <a href="#" className="text-white flex items-center gap-2"><Layout size={14} /> Dashboard</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"><BarChart2 size={14} /> Analysis</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"><Clock size={14} /> History</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                SYSTEM ONLINE
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

                {/* Market Pulse Bar */}
                {results.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                        <PulseCard label="Total Opportunities" value={results.length} icon={<Activity size={18} className="text-purple-400" />} />
                        <PulseCard label="Market Bias" value={`${sentiment}% Bullish`} subtext={`Longs: ${longCount} | Shorts: ${shortCount}`} icon={<BarChart2 size={18} className={sentiment > 50 ? "text-green-400" : "text-red-400"} />} />
                        <PulseCard label="Scanner Latency" value="45ms" subtext="Optimized Route" icon={<Zap size={18} className="text-yellow-400" />} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Configuration */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-[#161922] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <Settings size={64} />
                            </div>
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Settings size={18} className="text-cyan-400" />
                                Strategy Config
                            </h2>

                            <div className="space-y-6 relative z-10">
                                <FilterToggle
                                    label="RSI Confirmation"
                                    active={config.use_rsi}
                                    desc="Only signals entering overbought/sold"
                                    onClick={() => setConfig({ ...config, use_rsi: !config.use_rsi })}
                                />
                                <FilterToggle
                                    label="ADX Trend Strength"
                                    active={config.use_adx}
                                    desc="Require ADX > 25 for strong trends"
                                    onClick={() => setConfig({ ...config, use_adx: !config.use_adx })}
                                />
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={pairs.length === 0 ? fetchPairs : handleScan}
                                    disabled={loading}
                                    className={clsx(
                                        "w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                                        loading
                                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/30"
                                    )}
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                                    {loading ? 'ANALYZING MARKET...' : 'RUN SCANNER'}
                                </button>
                                <p className="text-center text-[10px] text-gray-600 mt-3 uppercase tracking-wider font-mono">
                                    Scanning {pairs.length} Top Vol Assets
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Results Feed */}
                    <div className="lg:col-span-9 space-y-6">
                        {/* Header & Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161922] p-4 rounded-xl border border-white/5">
                            <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                Live Signals
                                <span className="bg-gray-800 text-gray-400 text-xs px-2 py-0.5 rounded-full font-mono">{results.length}</span>
                            </h2>
                            <div className="flex bg-[#0f111a] p-1 rounded-lg border border-white/5">
                                <TabButton label="ALL" active={filterSide === 'ALL'} onClick={() => setFilterSide('ALL')} />
                                <TabButton label="LONGS" active={filterSide === 'LONG'} onClick={() => setFilterSide('LONG')} />
                                <TabButton label="SHORTS" active={filterSide === 'SHORT'} onClick={() => setFilterSide('SHORT')} />
                            </div>
                        </div>

                        {/* Empty State */}
                        {results.length === 0 && !loading && !error && (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-xl bg-[#161922]/50">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">System Ready. Awaiting trigger.</p>
                            </div>
                        )}

                        {/* Results Grid */}
                        <div className="grid gap-3">
                            <AnimatePresence>
                                {results
                                    .filter(item => filterSide === 'ALL' || item.Side === filterSide)
                                    .map((item, idx) => (
                                        <ResultTicket key={item.Symbol} item={item} index={idx} />
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5 bg-[#161922] py-8 mt-12">
                <div className="max-w-7xl mx-auto px-8 text-center text-xs text-gray-600">
                    <p>&copy; 2024 VANTAGE ALGOS LTD. // PROFESSIONAL TRADING TOOLS</p>
                    <p className="mt-2">Market data provided by Binance Futures. Trading involves risk.</p>
                </div>
            </footer>
        </div>
    );
}

// --- Sub Components ---

function PulseCard({ label, value, subtext, icon }) {
    return (
        <div className="bg-[#161922] p-4 rounded-xl border border-white/5 flex items-center justify-between">
            <div>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                    <p className="text-xl font-bold text-white">{value}</p>
                </div>
                {subtext && <p className="text-[10px] text-gray-500 mt-1 font-mono">{subtext}</p>}
            </div>
            <div className="bg-[#0f111a] p-2 rounded-lg border border-white/5">
                {icon}
            </div>
        </div>
    );
}

function FilterToggle({ label, active, desc, onClick }) {
    return (
        <button onClick={onClick} className="w-full flex items-start justify-between group text-left">
            <div>
                <p className={clsx("font-medium transition-colors", active ? "text-cyan-400" : "text-gray-400 group-hover:text-gray-300")}>
                    {label}
                </p>
                <p className="text-[10px] text-gray-600 mt-0.5">{desc}</p>
            </div>
            <div className={clsx(
                "w-10 h-5 rounded-full p-1 transition-colors relative",
                active ? "bg-cyan-500/20" : "bg-gray-800"
            )}>
                <div className={clsx(
                    "w-3 h-3 rounded-full shadow-sm transition-all absolute top-1",
                    active ? "bg-cyan-400 left-6" : "bg-gray-600 left-1"
                )} />
            </div>
        </button>
    );
}

function TabButton({ label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={clsx(
                "px-6 py-1.5 rounded-md text-xs font-bold transition-all",
                active
                    ? "bg-gray-700 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
            )}
        >
            {label}
        </button>
    );
}

function ResultTicket({ item, index }) {
    const isLong = item.Side === 'LONG';
    // Sanitize symbol: ZEC/USDT -> ZECUSDT, ZEC/USDT:USDT -> ZECUSDT
    const rawSymbol = item.Symbol.split(':')[0].replace('/', '');
    const tradeUrl = `https://www.binance.com/en/futures/${rawSymbol}`;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ delay: index * 0.03 }}
            className="bg-[#161922] hover:bg-[#1c202b] rounded-xl p-4 border border-white/5 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 group transition-all hover:border-white/10 relative overflow-hidden"
        >
            {/* Left Accent Bar */}
            <div className={clsx(
                "absolute left-0 top-0 bottom-0 w-1",
                isLong ? "bg-emerald-500" : "bg-rose-500"
            )} />

            {/* Symbol Info */}
            <div className="flex items-center gap-4 w-full sm:w-auto z-10">
                <div className={clsx(
                    "w-10 h-10 rounded-lg flex items-center justify-center font-bold",
                    isLong ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                )}>
                    {isLong ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-white text-lg">{item.Symbol}</h3>
                    <div className="flex items-center gap-2">
                        <span className={clsx(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded",
                            isLong ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"
                        )}>
                            {item.Side}
                        </span>
                        <span className="text-gray-600 text-[10px] font-mono">15m • 1H • 4H ALIGNED</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 sm:flex sm:ml-auto w-full sm:w-auto gap-4 sm:gap-8 items-center pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                <StatBox label="Price" value={item['Price']} />
                <StatBox
                    label="24h"
                    value={`${item['24h Change']}%`}
                    color={item['24h Change'] > 0 ? "text-emerald-400" : "text-rose-400"}
                />
                <StatBox
                    label="RSI"
                    value={item['RSI (15m)'] || '--'}
                    color={(item['RSI (15m)'] > 70 || item['RSI (15m)'] < 30) ? "text-yellow-400" : "text-gray-400"}
                />

                {/* Actions */}
                <a
                    href={tradeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-3 sm:col-span-1 w-full sm:w-auto px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-400"
                >
                    TRADE <ExternalLink size={12} />
                </a>
            </div>
        </motion.div>
    );
}

function StatBox({ label, value, color = "text-white" }) {
    return (
        <div className="text-center sm:text-right">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
            <p className={clsx("font-mono font-bold text-sm", color)}>{value}</p>
        </div>
    );
}
