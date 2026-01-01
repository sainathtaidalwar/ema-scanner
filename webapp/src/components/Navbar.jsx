import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { Menu, X, ChevronDown, ExternalLink } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    // Handle scroll effect
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', path: '/#features' },
        { name: 'Strategy', path: '/learn' },
        { name: 'Markets', path: '/#markets' },
    ];

    const isHome = location.pathname === '/';

    const handleScrollToSection = (id) => {
        if (!isHome) {
            navigate('/');
            setTimeout(() => {
                const element = document.getElementById(id.replace('#', ''));
                if (element) element.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } else {
            const element = document.getElementById(id.replace('#', ''));
            if (element) element.scrollIntoView({ behavior: 'smooth' });
        }
        setMobileMenuOpen(false);
    };

    return (
        <header
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#0f172a]/80 backdrop-blur-md border-b border-white/5 py-4' : 'bg-transparent py-6'
                }`}
        >
            <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
                {/* Logo */}
                <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
                    <Logo />
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <button
                            key={link.name}
                            onClick={() => link.path.startsWith('/#') ? handleScrollToSection(link.path.substring(1)) : navigate(link.path)}
                            className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                        >
                            {link.name}
                        </button>
                    ))}

                    <a
                        href="https://t.me/algosignalpulse"
                        target="_blank"
                        rel="noreferrer"
                        className="text-sm font-medium text-gray-300 hover:text-[#0088cc] transition-colors flex items-center gap-1"
                    >
                        Community <ExternalLink size={14} />
                    </a>
                </nav>

                {/* CTA Button */}
                <div className="hidden md:block">
                    <button
                        onClick={() => navigate('/scanner?market=crypto')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-lg shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
                    >
                        Launch App
                    </button>
                </div>

                {/* Mobile Menu Toggle */}
                <button
                    className="md:hidden text-gray-300 hover:text-white"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-[#0f172a] border-b border-white/5 overflow-hidden"
                    >
                        <div className="px-6 py-4 flex flex-col gap-4">
                            {navLinks.map((link) => (
                                <button
                                    key={link.name}
                                    onClick={() => handleScrollToSection(link.path.substring(1))}
                                    className="text-left py-2 text-gray-300 hover:text-white"
                                >
                                    {link.name}
                                </button>
                            ))}
                            <button
                                onClick={() => {
                                    navigate('/scanner');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full py-3 bg-indigo-600 text-white font-bold rounded-lg mt-2"
                            >
                                Launch Scanner
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
