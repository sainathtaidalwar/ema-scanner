import { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, ArrowDown, ArrowUp, RefreshCw, Settings, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

// Use environment variable for API URL in production, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api';

const [loading, setLoading] = useState(false);
const [results, setResults] = useState([]);
const [pairs, setPairs] = useState([]);
const [error, setError] = useState(null);

// Config State
const [config, setConfig] = useState({
    use_rsi: false,
    use_adx: false
});

// Fetch pairs on mount
useEffect(() => {
    fetchPairs();
}, []);

const fetchPairs = async () => {
    setError(null);
    try {
        // timeout 5s, if slow assume free tier cold start issue or fail
        const res = await axios.get(`${API_BASE}/pairs?limit=75`, { timeout: 8000 });
        if (res.data.pairs && res.data.pairs.length > 0) {
            setPairs(res.data.pairs);
        } else {
            throw new Error("Empty pairs list");
        }
    } catch (err) {
        console.error("Failed to fetch pairs, using fallback", err);
        // Don't show error to user, just ensure app is usable
        setPairs(FALLBACK_PAIRS);
        // Optionally set error toast or just proceed silently
    }
};

const handleScan = async () => {
    setLoading(true);
    setResults([]); // Clear previous to show fresh animation
    setError(null);
    try {
        const res = await axios.post(`${API_BASE}/scan`, {
            symbols: pairs,
            config: config
        });
        console.log("Scan results:", res.data);
        if (res.data.results && res.data.results.length === 0) {
            setError("No matching setups found.");
        }
        setResults(res.data.results || []);
    } catch (err) {
        console.error("Scan failed", err);
        setError("Scan request failed. Check server.");
    } finally {
        setLoading(false);
    }
};

return (
    <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <header className="flex items-center justify-between pb-6 border-b border-white/10">
            <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-500 bg-clip-text text-transparent">
                    ANTIGRAVITY // SCANNER
                </h1>
                <p className="text-gray-400 mt-2 flex items-center gap-2">
                    <Activity size={16} className="text-brand-glow" />
                    EMA Trend Detection System
                </p>
            </div>
            <div className="flex gap-4">
                {/* Maybe user profile or connection status here */}
            </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Controls Sidebar */}
            <div className="lg:col-span-1 space-y-6">
                <div className="glass-panel p-6">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <Settings size={20} className="text-cyber-cyan" />
                        Configuration
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-gray-300">RSI Filter</label>
                            <Toggle
                                enabled={config.use_rsi}
                                onChange={(v) => setConfig({ ...config, use_rsi: v })}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            {config.use_rsi ? 'Req: Long > 50, Short < 50' : 'RSI ignored'}
                        </p>

                        <div className="flex items-center justify-between">
                            <label className="text-gray-300">ADX Filter</label>
                            <Toggle
                                enabled={config.use_adx}
                                onChange={(v) => setConfig({ ...config, use_adx: v })}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            {config.use_adx ? 'Req: ADX > 20 & DI Confirmed' : 'ADX ignored'}
                        </p>
                    </div>

                    <div className="mt-8">
                        {error && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-red-200 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleScan}
                            disabled={loading || pairs.length === 0}
                            className={clsx(
                                "w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all",
                                loading || pairs.length === 0
                                    ? "bg-gray-700 cursor-not-allowed text-gray-400"
                                    : "bg-gradient-to-r from-brand to-cyan-500 hover:opacity-90 hover:shadow-lg hover:shadow-brand/20"
                            )}
                        >
                            {loading ? (
                                <RefreshCw className="animate-spin" />
                            ) : (
                                <Play size={20} fill="currentColor" />
                            )}
                            {loading ? 'SCANNING...' : pairs.length > 0 ? 'RUN SCAN' : 'LOADING PAIRS...'}
                        </button>
                        <p className="text-center text-xs text-gray-500 mt-2">
                            Scanning Top {pairs.length} Vol Pairs
                        </p>
                    </div>
                </div>
            </div>

            {/* Results Area */}
            <div className="lg:col-span-3">
                <div className="glass-panel min-h-[500px] p-6 overflow-hidden relative">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                        Results ({results.length})
                        {results.length > 0 && <span className="text-xs font-normal text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full">Live</span>}
                    </h2>

                    {results.length === 0 && !loading && !error && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                            <Activity size={48} className="mb-4 opacity-20" />
                            <p>Ready to scan. Press Run.</p>
                        </div>
                    )}

                    <div className="grid gap-3">
                        <AnimatePresence>
                            {results.map((item, idx) => (
                                <ResultCard key={item.Symbol} item={item} index={idx} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    </div>
);
}

// Helpers
function Toggle({ enabled, onChange }) {
    return (
        <button
            onClick={() => onChange(!enabled)}
            className={clsx(
                "w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out",
                enabled ? "bg-brand-glow" : "bg-gray-700"
            )}
        >
            <div
                className={clsx(
                    "w-4 h-4 bg-white rounded-full shadow-sm transform transition-transform duration-200",
                    enabled ? "translate-x-6" : "translate-x-0"
                )}
            />
        </button>
    );
}

function ResultCard({ item, index }) {
    const isLong = item.Side === 'LONG';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: index * 0.05 }}
            className="bg-dark-700/50 p-4 rounded-lg border border-white/5 hover:border-brand/30 transition-colors flex items-center justify-between group"
        >
            <div className="flex items-center gap-4">
                <div className={clsx(
                    "w-10 h-10 rounded-full flex items-center justify-center bg-opacity-20",
                    isLong ? "bg-green-500 text-green-400" : "bg-red-500 text-red-400"
                )}>
                    {isLong ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
                </div>
                <div>
                    <h3 className="font-bold text-lg tracking-wide">{item.Symbol}</h3>
                    <p className="text-xs text-gray-500">
                        4H: <span className="text-green-400">PASS</span> •
                        1H: <span className="text-green-400">PASS</span> •
                        15m: <span className="text-green-400">PASS</span>
                    </p>
                </div>
            </div>

            <div className="flex gap-8 text-sm">
                <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase">RSI (15m)</p>
                    <p className={clsx(
                        "font-mono font-bold",
                        item['RSI (15m)'] > 70 || item['RSI (15m)'] < 30 ? "text-yellow-400" : "text-white"
                    )}>
                        {item['RSI (15m)'] ?? '--'}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-500 text-xs uppercase">ADX (15m)</p>
                    <p className={clsx(
                        "font-mono font-bold",
                        item['ADX (15m)'] > 25 ? "text-brand-glow" : "text-gray-400"
                    )}>
                        {item['ADX (15m)'] ?? '--'}
                    </p>
                </div>
                <div className="text-right min-w-[100px]">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-xs font-bold ring-1 ring-inset",
                        isLong
                            ? "bg-green-500/10 text-green-400 ring-green-500/20"
                            : "bg-red-500/10 text-red-400 ring-red-500/20"
                    )}>
                        {item.Side}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
