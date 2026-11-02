import React, { useState, useEffect } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import {
  Tv,
  Film,
  Sparkles,
  Heart,
  Search,
  Menu,
  X,
  Radio,
  Flame,
  Clapperboard,
  Trophy,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { currentTab, setCurrentTab, favorites, setIsSearchOpen } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'home', label: 'Início', icon: <Flame className="w-4 h-4" /> },
    { id: 'channels', label: 'TV Ao Vivo', icon: <Radio className="w-4 h-4 text-rose-500 animate-pulse" />, badge: 'AO VIVO' },
    { id: 'filmes' as any, label: 'Filmes', icon: <Film className="w-4 h-4" /> },
    { id: 'series', label: 'Séries', icon: <Clapperboard className="w-4 h-4" /> },
    { id: 'doramas', label: 'Doramas', icon: <Sparkles className="w-4 h-4 text-amber-400" />, badge: 'TOP' },
    { id: 'matches', label: 'Jogos de Hoje', icon: <Trophy className="w-4 h-4 text-emerald-400" /> },
    {
      id: 'favorites',
      label: 'Minha Lista',
      icon: <Heart className="w-4 h-4 text-pink-400" />,
      badge: favorites.length > 0 ? `${favorites.length}` : undefined,
    },
  ];

  const handleNavClick = (id: NavTab) => {
    setCurrentTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-[#070913]/90 backdrop-blur-md border-b border-slate-800/80 shadow-2xl py-3'
          : 'bg-gradient-to-b from-[#070913]/95 via-[#070913]/60 to-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <div
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2.5 cursor-pointer group select-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300">
            <div className="w-full h-full bg-[#070913] rounded-[10px] flex items-center justify-center">
              <Tv className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            {/* Sirius Star Accent Dot */}
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-300 rounded-full" />
          </div>

          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-wider text-white flex items-center gap-1 font-mono">
              SIRIUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">TV</span>
            </span>
            <span className="text-[9px] uppercase tracking-widest text-cyan-400/80 font-semibold -mt-1 hidden sm:block">
              O Universo do Streaming
            </span>
          </div>
        </div>

        {/* Desktop Nav Items */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 group ${
                  active
                    ? 'text-white bg-slate-800/80 shadow-inner shadow-cyan-500/10 border border-slate-700/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/40'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                      item.badge === 'AO VIVO'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.badge === 'TOP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-sm shadow-cyan-400" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions: Search + Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-white text-xs sm:text-sm transition-all duration-200 shadow-sm"
            title="Buscar canais, filmes, séries e doramas (Ctrl+K)"
          >
            <Search className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden md:inline-block px-1.5 py-0.5 text-[10px] bg-slate-800 text-slate-400 border border-slate-700 rounded font-mono">
              Ctrl K
            </kbd>
          </button>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Abrir Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0a0d1d]/98 border-b border-slate-800 px-4 py-4 space-y-1.5 backdrop-blur-xl animate-in slide-in-from-top-2 duration-200 shadow-2xl">
          {navItems.map((item) => {
            const active = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-white border border-cyan-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  {item.icon}
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      item.badge === 'AO VIVO'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : item.badge === 'TOP'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
