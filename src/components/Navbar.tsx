import React, { useState, useEffect } from 'react';
import { useApp, NavTab } from '../context/AppContext';
import { Search, Tv, Server } from 'lucide-react';
import { ProviderModal } from './ProviderModal';

export const Navbar: React.FC = () => {
  const { currentTab, setCurrentTab, favorites, setIsSearchOpen } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [isProviderModalOpen, setIsProviderModalOpen] = useState(false);

  // Real-time Brazilian clock (UniTV / Smart TV style)
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
      setDateStr(
        now.toLocaleDateString('pt-BR', {
          weekday: 'short',
          day: '2-digit',
          month: 'short',
        }).replace('.', '')
      );
    };

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const navTabs: { id: NavTab; label: string; count?: number }[] = [
    { id: 'channels', label: 'AO VIVO' },
    { id: 'filmes' as any, label: 'FILMES' },
    { id: 'series', label: 'SÉRIES' },
    { id: 'doramas', label: 'DORAMAS' },
    {
      id: 'favorites',
      label: 'MINHA LISTA',
      count: favorites.length > 0 ? favorites.length : undefined,
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-[#080b14]/95 backdrop-blur-2xl border-b border-white/[0.07] px-4 sm:px-8 flex items-center justify-between select-none">
      {/* LEFT: Sleek Brand Logo */}
      <div
        onClick={() => setCurrentTab('channels')}
        className="flex items-center gap-3 cursor-pointer group py-1"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/40 flex items-center justify-center shadow-lg shadow-cyan-500/10 group-hover:border-cyan-400 transition-all">
          <Tv className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-lg font-black tracking-wider text-white">SIRIUS</span>
            <span className="text-lg font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
              TV
            </span>
          </div>
          <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase mt-0.5">
            IPTV ULTRA • 4K
          </span>
        </div>
      </div>

      {/* CENTER: Professional, Minimalist Typography Navigation (UniTV Style) */}
      <nav className="hidden md:flex items-center gap-1 sm:gap-2">
        {navTabs.map((tab) => {
          const isActive =
            currentTab === tab.id ||
            (tab.id === 'channels' && currentTab === 'home') ||
            (tab.id === ('filmes' as any) && currentTab === 'movies');

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`relative px-4 py-2 text-xs lg:text-sm font-bold tracking-widest transition-all duration-200 rounded-lg ${
                isActive
                  ? 'text-white bg-white/[0.08] shadow-inner'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.03]'
              }`}
            >
              <span>{tab.label}</span>

              {tab.count !== undefined && (
                <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  {tab.count}
                </span>
              )}

              {/* Glowing bottom line indicator for active tab */}
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-[2.5px] bg-gradient-to-r from-cyan-400 via-blue-500 to-cyan-400 rounded-full shadow-md shadow-cyan-400/80" />
              )}
            </button>
          );
        })}
      </nav>

      {/* RIGHT: Status, Search, Clock (UniTV OSD Bar) */}
      <div className="flex items-center gap-4">
        {/* Connection & Quality Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-black/40 border border-white/[0.06] text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-emerald-400 font-bold">ONLINE</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">1080P FHD</span>
        </div>

        {/* Provider & Lists Button */}
        <button
          onClick={() => setIsProviderModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 hover:text-white transition-all text-xs font-bold cursor-pointer"
          title="Configurar Provedor Xtream Codes ou Lista M3U"
        >
          <Server className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Provedor</span>
        </button>

        {/* Search Button */}
        <button
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-slate-300 hover:text-white transition-all text-xs font-medium cursor-pointer"
          title="Buscar canais, filmes ou séries (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-cyan-400" />
          <span className="hidden sm:inline text-slate-400">Buscar...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/40 text-slate-400 border border-white/[0.06]">
            Ctrl K
          </kbd>
        </button>

        {/* Digital Clock */}
        <div className="hidden sm:flex flex-col items-end leading-tight text-right pl-1 border-l border-white/[0.08]">
          <span className="font-mono text-sm font-black text-white tracking-wider">
            {timeStr || '00:00:00'}
          </span>
          <span className="text-[10px] font-medium text-slate-400 uppercase">
            {dateStr}
          </span>
        </div>
      </div>

      {/* Provider & Xtream Modal */}
      <ProviderModal
        isOpen={isProviderModalOpen}
        onClose={() => setIsProviderModalOpen(false)}
      />
    </header>
  );
};
