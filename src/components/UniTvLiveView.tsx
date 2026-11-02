import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { Channel, StreamSource } from '../types';
import { useApp } from '../context/AppContext';
import {
  Radio,
  Search,
  Star,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  Server,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Tv,
  Clock,
  Layers,
} from 'lucide-react';

export const UniTvLiveView: React.FC = () => {
  const { allChannels, favorites, toggleFavorite, isFavorite } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [serverIndex, setServerIndex] = useState(0);
  const [isTvFullscreen, setIsTvFullscreen] = useState(false);
  const [showZapHud, setShowZapHud] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const zapHudTimerRef = useRef<any>(null);

  // Set default channel when channels load
  useEffect(() => {
    if (!activeChannel && allChannels.length > 0) {
      const defaultCh = allChannels.find((c) => c.category === 'TV Aberta') || allChannels[0];
      setActiveChannel(defaultCh);
      setServerIndex(0);
    }
  }, [allChannels, activeChannel]);

  // Categories list with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    allChannels.forEach((c) => {
      const cat = c.category || 'Variedades';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list = [
      { name: 'Todos', count: allChannels.length },
      { name: 'Favoritos', count: allChannels.filter((c) => favorites.includes(c.id)).length },
    ];

    Array.from(map.entries())
      .sort((a, b) => b[1] - a[1])
      .forEach(([name, count]) => {
        list.push({ name, count });
      });

    return list;
  }, [allChannels, favorites]);

  // Filtered channels
  const filteredChannels = useMemo(() => {
    return allChannels.filter((c) => {
      if (selectedCategory === 'Favoritos') {
        if (!favorites.includes(c.id)) return false;
      } else if (selectedCategory !== 'Todos' && c.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.currentShow.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allChannels, selectedCategory, searchQuery, favorites]);

  // Current channel sources
  const currentSources: StreamSource[] = useMemo(() => {
    if (!activeChannel) return [];
    if (activeChannel.sources && activeChannel.sources.length > 0) {
      return activeChannel.sources;
    }
    return [{ name: 'Servidor 1', url: '', type: 'hls' }];
  }, [activeChannel]);

  const activeSource = currentSources[serverIndex] || currentSources[0];

  // Play Channel with Hls.js
  useEffect(() => {
    if (!activeChannel || !activeSource?.url) return;

    setHasError(false);
    setIsBuffering(true);

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 60,
        manifestLoadingTimeOut: 8000,
        levelLoadingTimeOut: 8000,
      });
      hlsRef.current = hls;

      hls.loadSource(activeSource.url);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsBuffering(false);
        video.play().catch(() => setIsPlaying(false));
      });

      hls.on(Hls.Events.ERROR, (_, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError();
              break;
            default:
              hls.destroy();
              setHasError(true);
              setIsBuffering(false);
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = activeSource.url;
      video.play().catch(() => setIsPlaying(false));
    }

    // Auto show ZapHUD for 5 seconds when tuning
    triggerZapHud();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, activeSource]);

  // Trigger ZapHUD
  const triggerZapHud = () => {
    setShowZapHud(true);
    clearTimeout(zapHudTimerRef.current);
    zapHudTimerRef.current = setTimeout(() => {
      setShowZapHud(false);
    }, 5000);
  };

  // Channel switching (Zapping)
  const tuneChannel = (channel: Channel) => {
    setActiveChannel(channel);
    setServerIndex(0);
  };

  const zapNext = () => {
    if (!activeChannel || filteredChannels.length === 0) return;
    const curIdx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    const nextIdx = (curIdx + 1) % filteredChannels.length;
    tuneChannel(filteredChannels[nextIdx]);
  };

  const zapPrev = () => {
    if (!activeChannel || filteredChannels.length === 0) return;
    const curIdx = filteredChannels.findIndex((c) => c.id === activeChannel.id);
    const prevIdx = (curIdx - 1 + filteredChannels.length) % filteredChannels.length;
    tuneChannel(filteredChannels[prevIdx]);
  };

  // Keyboard navigation for TV Remote
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === 'ArrowUp') {
        e.preventDefault();
        zapPrev();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        zapNext();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        triggerZapHud();
      } else if (e.key === 'Escape' && isTvFullscreen) {
        e.preventDefault();
        setIsTvFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredChannels, activeChannel, isTvFullscreen]);

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsTvFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsTvFullscreen(false)).catch(() => {});
    }
  };

  const currentChannelIndex = activeChannel
    ? filteredChannels.findIndex((c) => c.id === activeChannel.id) + 1
    : 1;

  return (
    <div className="w-full h-[calc(100vh-76px)] mt-[76px] bg-[#070913] text-slate-100 flex overflow-hidden select-none">
      {/* ========================================================
          COLUNA 1: CATEGORIAS (ESTILO UNITV)
      ======================================================== */}
      <aside className="w-48 sm:w-56 bg-[#0a0d1d] border-r border-slate-800/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800/80 flex items-center gap-2 text-cyan-400 font-bold text-sm tracking-wide">
          <Layers className="w-4 h-4" />
          <span>CATEGORIAS</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-1 px-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                tabIndex={0}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    isActive ? 'bg-black/20 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </aside>

      {/* ========================================================
          COLUNA 2: LISTA DE CANAIS (ESTILO UNITV COM NUMERAÇÃO)
      ======================================================== */}
      <aside className="w-72 sm:w-80 md:w-96 bg-[#080b18] border-r border-slate-800/80 flex flex-col shrink-0">
        {/* Search header */}
        <div className="p-3 border-b border-slate-800/80 bg-slate-950/40">
          <div className="relative flex items-center">
            <Search className="w-4 h-4 text-cyan-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal ou programa..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        {/* Channels List */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-slate-800/40">
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum canal encontrado.
            </div>
          ) : (
            filteredChannels.map((channel, idx) => {
              const isCurrent = activeChannel?.id === channel.id;
              const isFav = isFavorite(channel.id);
              const channelNumber = String(idx + 1).padStart(3, '0');

              return (
                <div
                  key={channel.id}
                  tabIndex={0}
                  onClick={() => tuneChannel(channel)}
                  onDoubleClick={toggleFullscreen}
                  className={`group flex items-center justify-between p-3 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-500/15 via-blue-500/10 to-transparent border-l-4 border-cyan-400 text-white'
                      : 'hover:bg-slate-900/60 text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {/* Number */}
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${
                        isCurrent ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {channelNumber}
                    </span>

                    {/* Logo */}
                    <div className="w-10 h-10 rounded-xl bg-slate-900 p-1 flex items-center justify-center shrink-0 border border-slate-800 group-hover:border-slate-700">
                      <img
                        src={channel.logoUrl}
                        alt={channel.name}
                        className="max-h-full max-w-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/80x80?text=' + encodeURIComponent(channel.name);
                        }}
                      />
                    </div>

                    {/* Name & Show */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs truncate group-hover:text-cyan-300">
                          {channel.name}
                        </span>
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                        {channel.currentShow.title}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(channel.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ml-2 ${
                      isFav
                        ? 'text-amber-400'
                        : 'text-slate-600 hover:text-slate-400 opacity-0 group-hover:opacity-100'
                    }`}
                    title={isFav ? 'Remover dos favoritos' : 'Favoritar canal'}
                  >
                    <Star className={`w-3.5 h-3.5 ${isFav ? 'fill-amber-400' : ''}`} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>

      {/* ========================================================
          COLUNA 3: PLAYER INTEGRADO + ZAPHUD (ESTILO UNITV)
      ======================================================== */}
      <main
        ref={playerContainerRef}
        onMouseMove={triggerZapHud}
        className={`flex-1 flex flex-col bg-black relative overflow-hidden ${
          isTvFullscreen ? 'fixed inset-0 z-50' : ''
        }`}
      >
        {/* Video Area */}
        <div className="relative w-full h-full flex items-center justify-center bg-black">
          {hasError ? (
            <div className="text-center p-6 space-y-4 z-20">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <Radio className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Canal sem sinal nesta fonte</h3>
              <p className="text-xs text-slate-400">
                Selecione outro servidor abaixo para continuar assistindo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {currentSources.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => setServerIndex(idx)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      idx === serverIndex
                        ? 'bg-cyan-400 text-slate-950'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {s.name || `Servidor ${idx + 1}`}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              playsInline
              onClick={triggerZapHud}
              onDoubleClick={toggleFullscreen}
            />
          )}

          {/* Buffering Spinner */}
          {isBuffering && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none">
              <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
            </div>
          )}

          {/* ========================================================
              ZAPHUD ESTILO UNITV (ON-SCREEN DISPLAY OVERLAY)
          ======================================================== */}
          {activeChannel && (
            <div
              className={`absolute left-4 right-4 bottom-4 transition-all duration-300 z-30 ${
                showZapHud ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 pointer-events-none'
              }`}
            >
              <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl bg-slate-950/90 backdrop-blur-xl border border-slate-800/90 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left info: Channel Number + Logo + Program */}
                <div className="flex items-center gap-4 min-w-0">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                    {String(currentChannelIndex).padStart(3, '0')}
                  </span>

                  <div className="w-12 h-12 rounded-xl bg-slate-900 p-1.5 flex items-center justify-center border border-slate-800 shrink-0">
                    <img
                      src={activeChannel.logoUrl}
                      alt={activeChannel.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-white truncate">
                        {activeChannel.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 font-black uppercase">
                        AO VIVO
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-bold uppercase hidden sm:inline">
                        1080p FHD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {activeChannel.currentShow.title}
                      </span>
                      <span className="text-slate-500 font-mono hidden sm:inline">
                        ({activeChannel.currentShow.startTime} - {activeChannel.currentShow.endTime})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls: Server Switcher + Zap buttons + Fullscreen */}
                <div className="flex items-center gap-3 shrink-0 flex-wrap">
                  {/* Server selector */}
                  <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                    <Server className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
                    {currentSources.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => setServerIndex(idx)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                          idx === serverIndex
                            ? 'bg-cyan-400 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {s.name || `S${idx + 1}`}
                      </button>
                    ))}
                  </div>

                  {/* Channel zap navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={zapPrev}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Canal Anterior (Seta Cima)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={zapNext}
                      className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                      title="Próximo Canal (Seta Baixo)"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Fullscreen toggle */}
                  <button
                    onClick={toggleFullscreen}
                    className="p-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 border border-cyan-500/40 transition-colors"
                    title={isTvFullscreen ? 'Sair da tela cheia' : 'Tela cheia (Modo TV)'}
                  >
                    {isTvFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
