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
                // Initial scan with empty strategy (Legacy Default) or a default preset
                await handleScan(res.data.pairs, []);
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

    const handleScan = async (manualPairs = null, manualRules = null) => {
        const targets = Array.isArray(manualPairs) ? manualPairs : pairs;
        const activeRules = manualRules || strategy.rules;

        if (!targets || targets.length === 0) return;

        setLoading(true);
        setResults([]);
        setError(null);
        try {
            const res = await axios.post(`${API_BASE}/scan`, {
                symbols: targets,
                config: { rules: activeRules } // Send as 'config' to match backend expectation
            });

            if (res.data.results && res.data.results.length === 0) {
                // If strategy was stricter than default, we might get 0 results
                if (activeRules.length > 0) setError("No setups found matching your Strategy.");
                // else setError("No market opportunities found.");
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

    // --- Strategy Helpers ---
    const addRule = (type) => {
        const newRule = { id: Date.now(), indicator: type, operator: '>', value: 0 };
        // Set defaults based on type
        if (type === 'RVOL') { newRule.params = { period: 30 }; newRule.value = 1.5; }
        if (type === 'RSI') { newRule.params = { period: 14 }; newRule.operator = '<'; newRule.value = 30; }
        if (type === 'ADX') { newRule.params = { period: 14 }; newRule.value = 25; }
        if (type === 'BB_WIDTH') { newRule.params = { length: 20, mult: 2 }; newRule.operator = '<'; newRule.value = 0.10; } // 10% width

        setStrategy(prev => ({ ...prev, rules: [...prev.rules, newRule] }));
    };

    const removeRule = (id) => {
        setStrategy(prev => ({ ...prev, rules: prev.rules.filter(r => r.id !== id) }));
    };

    const updateRule = (id, field, value) => {
        setStrategy(prev => ({
            ...prev,
            rules: prev.rules.map(r => r.id === id ? { ...r, [field]: value } : r)
        }));
    };

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
                                VANTAGE <span className="text-gray-500 font-light">// TERMINAL v2.0</span>
                            </span>
                        </div>
                        <div className="hidden md:flex gap-8 text-sm font-medium">
                            <a href="#" className="text-white flex items-center gap-2"><Layout size={14} /> Terminal</a>
                            <a href="#" className="text-gray-500 hover:text-white transition-colors flex items-center gap-2"><BarChart2 size={14} /> Backtest</a>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-mono flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                ENGINE ONLINE
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
                        <PulseCard label="Total Matches" value={results.length} icon={<Activity size={18} className="text-purple-400" />} />
                        <PulseCard label="Market Bias" value={`${sentiment}% Bullish`} subtext={`Longs: ${longCount} | Shorts: ${shortCount}`} icon={<BarChart2 size={18} className={sentiment > 50 ? "text-green-400" : "text-red-400"} />} />
                        <PulseCard label="Active Strategy" value={`${strategy.rules.length} Custom Rules`} subtext={strategy.rules.length === 0 ? "Default EMA Logic" : "Dynamic Engine"} icon={<Zap size={18} className="text-yellow-400" />} />
                    </motion.div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Strategy Builder Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#161922] border border-white/5 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col h-full">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Settings size={18} className="text-cyan-400" />
                                    Strategy Builder
                                </h2>
                                <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono">BETA</span>
                            </div>

                            {/* Rule List */}
                            <div className="space-y-3 flex-grow mb-6 max-h-[400px] overflow-y-auto custom-scrollbar">
                                {strategy.rules.length === 0 && (
                                    <div className="text-center p-6 border-2 border-dashed border-white/5 rounded-lg text-gray-600">
                                        <ShieldCheck size={32} className="mx-auto mb-2 opacity-50" />
                                        <p className="text-xs">No custom rules.</p>
                                        <p className="text-[10px] opacity-70">Running default EMA Trend logic.</p>
                                    </div>
                                )}
                                <AnimatePresence>
                                    {strategy.rules.map(rule => (
                                        <RuleCard key={rule.id} rule={rule} onRemove={() => removeRule(rule.id)} onUpdate={updateRule} />
                                    ))}
                                </AnimatePresence>
                            </div>

                            {/* Add Rule Buttons */}
                            <div className="grid grid-cols-2 gap-2 mb-6">
                                <AddButton label="RVOL" onClick={() => addRule('RVOL')} icon={<BarChart2 size={12} />} />
                                <AddButton label="Squeeze" onClick={() => addRule('BB_WIDTH')} icon={<AlertTriangle size={12} />} />
                                <AddButton label="RSI" onClick={() => addRule('RSI')} icon={<Activity size={12} />} />
                                <AddButton label="ADX Trend" onClick={() => addRule('ADX')} icon={<TrendingUp size={12} />} />
                            </div>

                            <div className="pt-6 border-t border-white/5 mt-auto">
                                {error && (
                                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs text-center font-medium">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={() => handleScan()}
                                    disabled={loading}
                                    className={clsx(
                                        "w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg",
                                        loading
                                            ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                                            : "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-500/20 hover:shadow-cyan-500/30"
                                    )}
                                >
                                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Play size={20} fill="currentColor" />}
                                    {loading ? 'RUN STRATEGY' : 'SCAN MARKET'}
                                </button>
                                <p className="text-center text-[10px] text-gray-600 mt-3 uppercase tracking-wider font-mono">
                                    Deep Scanning {pairs.length} Assets
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Main Results Feed */}
                    <div className="lg:col-span-8 space-y-6">
                        {/* Header & Filters */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#161922] p-4 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <h2 className="text-lg font-bold text-white">Live Signals</h2>
                                {results.some(r => r.RVOL) && <span className="text-[10px] bg-purple-500/10 text-purple-400 px-2 py-0.5 rounded border border-purple-500/20">RVOL Mode</span>}
                            </div>
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
                                <p className="text-sm">Build your strategy and press Scan.</p>
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
                    <p>&copy; 2025 VANTAGE SYSTEMS // INSTITUTIONAL GRADE v2.0</p>
                    <p className="mt-2 text-gray-700">Execution involves risk. System latency: 42ms.</p>
                </div>
            </footer>
        </div>
    );
}

// --- Sub Components ---

function AddButton({ label, onClick, icon }) {
    return (
        <button onClick={onClick} className="flex items-center justify-center gap-2 p-3 rounded-lg bg-[#0f111a] border border-white/5 hover:border-cyan-500/50 hover:bg-cyan-500/5 transition-all text-xs font-bold text-gray-400 hover:text-cyan-400 group">
            {icon} {label} <Plus size={10} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
    )
}

function RuleCard({ rule, onRemove, onUpdate }) {
    return (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0f111a] rounded-lg p-3 border border-white/5 group hover:border-white/10"
        >
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-cyan-400 flex items-center gap-2">
                    {rule.indicator === 'BB_WIDTH' ? 'BOLLINGER SQZ' : rule.indicator}
                </span>
                <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 size={12} />
                </button>
            </div>

            <div className="flex items-center gap-2">
                <select
                    value={rule.operator}
                    onChange={(e) => onUpdate(rule.id, 'operator', e.target.value)}
                    className="bg-[#161922] text-[10px] text-white rounded px-2 py-1 border border-white/10 outline-none focus:border-cyan-500/50 w-16"
                >
                    <option value=">">&gt;</option>
                    <option value="<">&lt;</option>
                    <option value=">=">&gt;=</option>
                    <option value="<=">&lt;=</option>
                </select>

                <input
                    type="number"
                    value={rule.value}
                    onChange={(e) => onUpdate(rule.id, 'value', parseFloat(e.target.value))}
                    className="bg-[#161922] text-xs font-mono text-white rounded px-2 py-1 border border-white/10 outline-none focus:border-cyan-500/50 w-full"
                />
            </div>
            <p className="text-[10px] text-gray-600 mt-2 font-mono">
                {rule.indicator === 'RVOL' && `Period: 30`}
                {rule.indicator === 'RSI' && `Length: 14`}
                {rule.indicator === 'ADX' && `Trend Strength`}
                {rule.indicator === 'BB_WIDTH' && `Band Width %`}
            </p>
        </motion.div>
    )
}

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
    // Sanitize symbol: ZEC/USDT -> ZECUSDT
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
                        <span className="text-gray-600 text-[10px] font-mono">
                            {item.RVOL ? `RVOL: ${item.RVOL}` : 'EMA ALIGNED'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 sm:flex sm:ml-auto w-full sm:w-auto gap-4 sm:gap-8 items-center pt-4 sm:pt-0 border-t border-white/5 sm:border-0">
                <StatBox label="Price" value={item['Price']} />
                <StatBox
                    label="24h"
                    value={`${item['24h Change']}%`}
                    color={item['24h Change'] > 0 ? "text-emerald-400" : "text-rose-400"}
                />

                {/* Dynamic Stats based on Engine Results */}
                {item.RVOL && <StatBox label="RVOL" value={item.RVOL} color="text-purple-400" />}
                {item.BB_WIDTH && <StatBox label="SQZ %" value={item.BB_WIDTH} color="text-yellow-400" />}

                {/* Actions */}
                <a
                    href={tradeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="col-span-4 sm:col-span-1 min-w-[100px] px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors group-hover:bg-cyan-500/10 group-hover:text-cyan-400"
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
