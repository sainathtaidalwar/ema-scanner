import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { Logo } from './Logo';
import { useNavigate } from 'react-router-dom';
import { Activity, ArrowDown, ArrowUp, RefreshCw, Settings, Play, ExternalLink, BarChart2, Zap, Layout, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Use environment variable for API URL in production, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

export default function ScannerDashboard() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // General loading (fetching pairs)
    const [isScanning, setIsScanning] = useState(false); // Specific to analysis
    const [results, setResults] = useState([]);
    const [pairs, setPairs] = useState([]);
    const [error, setError] = useState(null);
    const [filterSide, setFilterSide] = useState('ALL'); // ALL, LONG, SHORT
    const [selectedExchange, setSelectedExchange] = useState('binance');
    const [lastUpdated, setLastUpdated] = useState(null);
    const [config, setConfig] = useState({
        use_rsi: false,
        use_adx: false, // Default disabled as requested
        only_pulse: false // New Filter: Only Sniper/Pulse entries
    });

    const EXCHANGES = [
        { id: 'binance', name: 'Binance', color: 'text-yellow-400', url: 'https://www.binance.com/en/futures/' },
        { id: 'bybit', name: 'Bybit', color: 'text-orange-400', url: 'https://www.bybit.com/trade/' },
        { id: 'mexc', name: 'MEXC', color: 'text-green-400', url: 'https://www.mexc.com/exchange/' },
        { id: 'coinbase', name: 'Coinbase', color: 'text-blue-500', url: ' https://www.coinbase.com/advanced-trade/' }
    ];

    const fetchTopPairs = async () => {
        try {
            // Updated to pass exchange
            const res = await axios.get(`${API_BASE}/pairs?limit=150&exchange=${selectedExchange}`);
            return res.data.pairs;
        } catch (err) {
            console.error("Failed to fetch pairs", err);
            return [];
        }
    };

    useEffect(() => {
        let mounted = true;
        const init = async () => {
            setLoading(true);
            setResults([]); // Clear old results to avoid confusion

            const fetchedPairs = await fetchTopPairs();

            if (mounted) {
                if (fetchedPairs && fetchedPairs.length > 0) {
                    setPairs(fetchedPairs);
                    // Removed auto-scan call
                }
                setLoading(false);
            }
        };
        init();
        return () => { mounted = false; };
    }, [selectedExchange]);

    const handleScan = async (manualPairs = null) => {
        let targets = Array.isArray(manualPairs) ? manualPairs : pairs;

        // If no pairs loaded, try to fetch them first
        if (!targets || targets.length === 0) {
            setLoading(true);
            const freshPairs = await fetchTopPairs();
            if (freshPairs && freshPairs.length > 0) {
                setPairs(freshPairs);
                targets = freshPairs;
            } else {
                setLoading(false);
                setError("Could not fetch assets to scan. Please try again.");
                return;
            }
            setLoading(false);
        }

        setIsScanning(true);
        setResults([]);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/scan`, {
                symbols: targets,
                config: config,
                exchange: selectedExchange // Critical Fix: Pass selected exchange
            });
            if (res.data.results && res.data.results.length === 0) {
                setError("No setups found matching current criteria.");
            }
            setResults(res.data.results || []);
        } catch (err) {
            console.error("Scan failed", err);
            setError("Scan execution failed.");
        } finally {
            setIsScanning(false);
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
                        <div onClick={() => navigate('/')} className="cursor-pointer">
                            <Logo />
                        </div>
                        <div className="hidden md:flex gap-8 text-sm font-medium">
                            <button
                                onClick={() => navigate('/')}
                                className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"
                            >
                                <Layout size={14} /> Back to Home
                            </button>
                            <a href="#" className="text-white flex items-center gap-2"><BarChart2 size={14} /> Dashboard</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"><BarChart2 size={14} /> Analysis</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"><Clock size={14} /> History</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
                        <PulseCard label="Market Bias" value={`${sentiment}% Bullish`} subtext={`Longs: ${longCount} | Shorts: ${shortCount}`} icon={<BarChart2 size={18} className={sentiment > 50 ? "text-emerald-400" : "text-rose-400"} />} />
                        <PulseCard label="Scanner Latency" value="45ms" subtext="Optimized Route" icon={<Zap size={18} className="text-yellow-400" />} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Configuration */}
                    <div className="lg:col-span-3 space-y-6">
                        {/* Exchange Selector & Config */}
                        <div className="bg-[#161922] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden">
                            <div className="bg-[#0f111a] rounded-xl border border-white/5 p-6 space-y-6">
                                <div>
                                    <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-4">
                                        <Settings size={20} className="text-indigo-400" />
                                        Exchange
                                    </h2>
                                    <div className="grid grid-cols-2 gap-2">
                                        {EXCHANGES.map(ex => (
                                            <button
                                                key={ex.id}
                                                onClick={() => setSelectedExchange(ex.id)}
                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${selectedExchange === ex.id
                                                    ? 'bg-indigo-500/20 border-indigo-500 text-white'
                                                    : 'bg-white/5 border-transparent text-gray-400 hover:bg-white/10'
                                                    }`}
                                            >
                                                {ex.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <h2 className="text-lg font-bold text-gray-200 flex items-center gap-2 mb-4">
                                        <Settings size={20} className="text-indigo-400" />
                                        Strategy Config
                                    </h2>

                                    <div className="space-y-4">
                                        <FilterToggle
                                            label="RSI Confirmation"
                                            active={config.use_rsi}
                                            desc="Only signals entering overbought/sold"
                                            onClick={() => setConfig({ ...config, use_rsi: !config.use_rsi })}
                                        />
                                        <FilterToggle
                                            label="ADX Trend Strength"
                                            active={config.use_adx}
                                            desc="Require ADX > 25 (Strong Trend)"
                                            onClick={() => setConfig({ ...config, use_adx: !config.use_adx })}
                                        />
                                        <FilterToggle
                                            label="Sniper Mode"
                                            active={config.only_pulse}
                                            desc="Show only High-Probability Pulse entries"
                                            onClick={() => setConfig({ ...config, only_pulse: !config.only_pulse })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Area */}
                        <div className="mt-8 pt-6 border-t border-white/5">
                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                                    {error}
                                </div>
                            )}

                            <button
                                onClick={() => handleScan()}
                                disabled={loading || isScanning}
                                className={clsx(
                                    "w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                                    (loading || isScanning)
                                        ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-500/20 hover:shadow-indigo-500/30"
                                )}
                            >
                                {(loading || isScanning) ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                                {isScanning ? 'ANALYZING MARKET...' : loading ? 'FETCHING ASSETS...' : 'RUN SCANNER'}
                            </button>
                            <p className="text-center text-[10px] text-gray-600 mt-3 uppercase tracking-wider font-mono">
                                {pairs.length > 0 ? `Ready to Scan ${pairs.length} Assets` : 'Initializing...'}
                            </p>
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

                        {/* Loading State - Centered Logo */}
                        {isScanning && (
                            <div className="h-96 flex flex-col items-center justify-center">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.5 }}
                                    className="scale-150 mb-8"
                                >
                                    <Logo showText={false} />
                                </motion.div>
                                <p className="text-indigo-400 font-mono text-sm animate-pulse tracking-widest">ANALYZING MARKET...</p>
                                <p className="text-gray-600 text-xs mt-2 font-mono">Scanning {pairs.length} assets on {EXCHANGES.find(e => e.id === selectedExchange)?.name}</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {results.length === 0 && !isScanning && !loading && !error && (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-600 border border-dashed border-gray-800 rounded-xl bg-[#161922]/50">
                                <Activity size={48} className="mb-4 opacity-20" />
                                <p className="text-sm">System Ready. Awaiting trigger.</p>
                            </div>
                        )}

                        {/* Results Grid */}
                        <div className="grid gap-3">
                            <AnimatePresence>
                                {results
                                    .filter(item => {
                                        const sideMatch = filterSide === 'ALL' || item.Side === filterSide;
                                        const typeMatch = !config.only_pulse || item.Type === 'PULSE';
                                        const adxMatch = !config.use_adx || (item['ADX (15m)'] > 25);
                                        const rsiMatch = !config.use_rsi || (item['RSI (15m)'] > 70 || item['RSI (15m)'] < 30);
                                        return sideMatch && typeMatch && adxMatch && rsiMatch;
                                    })
                                    .map((item, idx) => (
                                        <ResultTicket
                                            key={item.Symbol}
                                            item={item}
                                            index={idx}
                                            exchange={selectedExchange}
                                        />
                                    ))}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="border-t border-white/5 bg-[#161922] py-8 mt-12">
                <div className="max-w-7xl mx-auto px-8 text-center">
                    <p className="text-xs text-indigo-400 font-medium tracking-wide mb-2 uppercase">Multi-Indicator Algo Trading Signals</p>
                    <p className="text-[10px] text-gray-600">&copy; {new Date().getFullYear()} Algo Signal Pulse. All rights reserved.</p>
                    <p className="mt-1 text-[10px] text-gray-700">Market data provided by Binance Futures. Trading involves risk.</p>
                </div>
            </footer>
        </div>
    );
}

ScannerDashboard.propTypes = {
    onBack: PropTypes.func.isRequired
};

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

PulseCard.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    subtext: PropTypes.string,
    icon: PropTypes.element.isRequired,
};

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

FilterToggle.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    desc: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired,
};

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

TabButton.propTypes = {
    label: PropTypes.string.isRequired,
    active: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
};

const ResultTicket = ({ item, index, exchange }) => {
    const isLong = item.Side === 'LONG';
    // Sanitize symbol: ZEC/USDT -> ZECUSDT, ZEC/USDT:USDT -> ZECUSDT
    const rawSymbol = item.Symbol.split(':')[0].replace('/', '');
    const baseAsset = item.Symbol.split('/')[0];

    let tradeUrl = '#';
    // Generate Exchange Specific URLs
    if (exchange === 'binance') {
        tradeUrl = `https://www.binance.com/en/futures/${rawSymbol}?ref=L0Q2H2MC`;
    } else if (exchange === 'bybit') {
        tradeUrl = `https://www.bybit.com/trade/usdt/${rawSymbol}`;
    } else if (exchange === 'mexc') {
        tradeUrl = `https://www.mexc.com/exchange/${rawSymbol}?type=linear_swap&inviteCode=FVh62Bzi`;
    } else if (exchange === 'coinbase') {
        tradeUrl = `https://www.coinbase.com/advanced-trade/spot/${baseAsset}-USD`;
    }

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.03 }}
            className={`
                p-4 rounded-xl border border-white/5 relative group overflow-hidden
                ${item.Side === 'LONG' ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'bg-red-500/5 hover:bg-red-500/10'}
            `}
        >
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-lg font-bold ${item.Side === 'LONG' ? 'text-emerald-400' : 'text-red-400'}`}>
                            {item.Symbol}
                        </span>
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.Side === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                            {item.Side}
                        </div>
                        {/* Setup Type Badge */}
                        <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${item.Type === 'PULSE'
                            ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                            : 'bg-gray-700/30 text-gray-400 border-transparent'
                            }`}>
                            {item.Type === 'PULSE' ? 'SNIPER' : 'MOMENTUM'}
                        </div>
                        {/* Source Verification Badge */}
                        <div className="px-2 py-0.5 rounded text-[10px] font-mono text-gray-500 bg-gray-800/50 border border-gray-700">
                            {item.Exchange || exchange}
                        </div>
                    </div>
                    <div className="text-xl font-mono text-white">
                        {item.Price}
                    </div>
                </div>

                {/* External Link - Always Visible but Calm by default */}
                <a
                    href={tradeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2 bg-white/5 text-gray-400 border border-white/10 rounded-lg text-xs font-bold transition-all flex items-center gap-2 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-transparent group-hover:shadow-lg group-hover:shadow-indigo-500/20"
                >
                    TRADE <ExternalLink size={14} />
                </a>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4 text-xs">
                {/* Restored 24h Change */}
                <div className="p-2 bg-[#0f111a] rounded-lg border border-white/5">
                    <div className="text-gray-500 mb-1">24h Change</div>
                    <div className={`${item['24h Change'] >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-bold`}>
                        {item['24h Change'] > 0 ? '+' : ''}{item['24h Change']}%
                    </div>
                </div>
                <div className="p-2 bg-[#0f111a] rounded-lg border border-white/5">
                    <div className="text-gray-500 mb-1">RSI (15m)</div>
                    <div className={item['RSI (15m)'] > 70 || item['RSI (15m)'] < 30 ? 'text-yellow-400 font-bold' : 'text-gray-300'}>
                        {item['RSI (15m)']}
                    </div>
                </div>
                <div className="p-2 bg-[#0f111a] rounded-lg border border-white/5">
                    <div className="text-gray-500 mb-1">ADX Strength</div>
                    <div className={item['ADX (15m)'] > 25 ? 'text-emerald-400 font-bold' : 'text-gray-300'}>
                        {item['ADX (15m)']}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

ResultTicket.propTypes = {
    item: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    exchange: PropTypes.string.isRequired
};

export const StatBox = ({ label, value, isPositive }) => (
    <div className="bg-[#161922] p-4 rounded-xl border border-white/5">
        <div className="text-gray-500 text-xs mb-1 uppercase tracking-wider">{label}</div>
        <div className={`text-xl font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {value}
        </div>
    </div>
);

StatBox.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    isPositive: PropTypes.bool.isRequired,
};
