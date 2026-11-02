import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { Channel, StreamSource } from '../types';
import { useApp } from '../context/AppContext';
import { resolvePlayableUrl } from '../utils/streamUrl';
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
  Clock,
  Layers,
  AlertTriangle,
  RotateCcw,
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
  const [statusMessage, setStatusMessage] = useState('Carregando sinal...');
  const [hasError, setHasError] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const zapHudTimerRef = useRef<any>(null);
  const retryCountRef = useRef<number>(0);

  // Set default channel when channels load (prefers Band or Globo or first channel)
  useEffect(() => {
    if (!activeChannel && allChannels.length > 0) {
      const defaultCh =
        allChannels.find((c) => c.name.toLowerCase() === 'band') ||
        allChannels.find((c) => c.category === 'TV Aberta') ||
        allChannels[0];
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

  // Robust Stream Player with Multi-Stage Proxy and Auto-Server Fallback
  useEffect(() => {
    if (!activeChannel || !activeSource?.url) return;

    setHasError(false);
    setIsBuffering(true);
    setStatusMessage(`Sintonizando ${activeChannel.name}...`);
    retryCountRef.current = 0;

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const startPlayback = (targetUrl: string, isProxy = false) => {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 60,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 2,
          levelLoadingTimeOut: 10000,
        });
        hlsRef.current = hls;

        hls.loadSource(targetUrl);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          setHasError(false);
          const playPromise = video.play();
          if (playPromise !== undefined) {
            playPromise
              .then(() => setIsPlaying(true))
              .catch((err) => {
                // If browser blocks unmuted autoplay, mute and continue immediately
                console.warn('Autoplay unmuted blocked by browser, muting...', err);
                video.muted = true;
                setIsMuted(true);
                video.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
              });
          }
        });

        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                if (!isProxy) {
                  // Direct stream failed, try proxy immediately
                  console.log(`Direct playback failed for ${activeChannel.name}, trying proxy...`);
                  setStatusMessage('Ajustando rota de conexão...');
                  hls.destroy();
                  const proxyUrl = resolvePlayableUrl(activeSource.url, true);
                  startPlayback(proxyUrl, true);
                  return;
                }

                // If proxy also failed on this server, try next server
                if (retryCountRef.current < currentSources.length - 1) {
                  retryCountRef.current += 1;
                  const nextIndex = (serverIndex + 1) % currentSources.length;
                  console.log(`Switching to backup server ${nextIndex + 1}...`);
                  setStatusMessage(`Conectando ao Servidor ${nextIndex + 1}...`);
                  hls.destroy();
                  setServerIndex(nextIndex);
                  return;
                }

                hls.destroy();
                setHasError(true);
                setIsBuffering(false);
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
        video.src = targetUrl;
        video.play().catch(() => {
          video.muted = true;
          setIsMuted(true);
          video.play().catch(() => setIsPlaying(false));
        });
      }
    };

    // First try: resolve optimal URL (direct or proxy depending on domain)
    const initialUrl = resolvePlayableUrl(activeSource.url);
    startPlayback(initialUrl, initialUrl.includes('/api/proxy'));

    triggerZapHud();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeChannel, serverIndex]);

  // Trigger ZapHUD for 5 seconds
  const triggerZapHud = () => {
    setShowZapHud(true);
    clearTimeout(zapHudTimerRef.current);
    zapHudTimerRef.current = setTimeout(() => {
      setShowZapHud(false);
    }, 5000);
  };

  // Channel switching (Zapping)
  const tuneChannel = (channel: Channel) => {
    if (activeChannel?.id === channel.id) return;
    setActiveChannel(channel);
    setServerIndex(0);
    setHasError(false);
    setIsBuffering(true);
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

  // Keyboard navigation for TV Remote D-Pad
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
      playerContainerRef.current
        .requestFullscreen()
        .then(() => setIsTvFullscreen(true))
        .catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsTvFullscreen(false)).catch(() => {});
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const currentChannelIndex = activeChannel
    ? filteredChannels.findIndex((c) => c.id === activeChannel.id) + 1
    : 1;

  return (
    <div className="w-full h-[calc(100vh-64px)] mt-16 bg-[#060810] text-slate-100 flex overflow-hidden select-none">
      {/* ========================================================
          COLUNA 1: CATEGORIAS (ESTILO UNITV)
      ======================================================== */}
      <aside className="w-44 sm:w-52 bg-[#080b16] border-r border-white/[0.06] flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-white/[0.06] flex items-center gap-2 text-cyan-400 font-bold text-xs tracking-widest uppercase">
          <Layers className="w-4 h-4" />
          <span>Categorias</span>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar py-2 space-y-0.5 px-2">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.name;
            return (
              <button
                key={cat.name}
                tabIndex={0}
                onClick={() => setSelectedCategory(cat.name)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <span className="truncate">{cat.name}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-black/30 text-slate-950 font-bold' : 'text-slate-500'
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
          COLUNA 2: LISTA DE CANAIS (ESTILO UNITV)
      ======================================================== */}
      <aside className="w-56 sm:w-68 bg-[#0a0e1c] border-r border-white/[0.06] flex flex-col shrink-0">
        {/* Search Input */}
        <div className="p-2.5 border-b border-white/[0.06]">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar canal..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-black/40 border border-white/[0.08] text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>
        </div>

        {/* Channel Items List */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-white/[0.03]">
          {filteredChannels.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Nenhum canal encontrado
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
                  className={`group flex items-center justify-between p-2.5 cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/10 to-transparent border-l-4 border-cyan-400 text-white'
                      : 'hover:bg-white/[0.03] text-slate-300 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    {/* Number */}
                    <span
                      className={`font-mono text-xs font-bold shrink-0 ${
                        isCurrent ? 'text-cyan-400' : 'text-slate-500'
                      }`}
                    >
                      {channelNumber}
                    </span>

                    {/* Logo */}
                    <div className="w-9 h-9 rounded-xl bg-black/60 p-1 flex items-center justify-center shrink-0 border border-white/[0.08] group-hover:border-cyan-500/40">
                      <img
                        src={channel.logoUrl}
                        alt={channel.name}
                        className="max-h-full max-w-full object-contain filter drop-shadow"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            'https://via.placeholder.com/60x60?text=' + encodeURIComponent(channel.name);
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
                      <span className="text-[10px] text-slate-400 truncate block mt-0.5">
                        {channel.currentShow?.title || 'Programação Ao Vivo'}
                      </span>
                    </div>
                  </div>

                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(channel.id);
                    }}
                    className={`p-1.5 rounded-lg transition-colors ml-1 ${
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
            <div className="text-center p-6 space-y-4 z-20 max-w-md">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Falha ao reproduzir sinal</h3>
              <p className="text-xs text-slate-400">
                O servidor atual não respondeu. Tente alternar para os servidores de backup abaixo.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {currentSources.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setServerIndex(idx);
                      setHasError(false);
                      setIsBuffering(true);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      idx === serverIndex
                        ? 'bg-cyan-400 text-slate-950 font-black'
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
              className="w-full h-full object-contain cursor-pointer"
              playsInline
              autoPlay
              onClick={togglePlay}
              onDoubleClick={toggleFullscreen}
            />
          )}

          {/* Buffering Indicator */}
          {isBuffering && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none z-20">
              <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
              <span className="text-xs font-semibold text-cyan-200 mt-3 drop-shadow">
                {statusMessage}
              </span>
            </div>
          )}

          {/* Muted Autoplay Pill (Click to Unmute) */}
          {isMuted && !isBuffering && !hasError && (
            <button
              onClick={toggleMute}
              className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/[0.1] text-xs font-bold flex items-center gap-2 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:scale-105"
            >
              <VolumeX className="w-4 h-4 text-cyan-400" />
              <span>Clique para ativar o som</span>
            </button>
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
              <div className="p-3.5 sm:p-4 rounded-2xl bg-[#080c18]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                {/* Left info: Channel Number + Logo + Program */}
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
                    {String(currentChannelIndex).padStart(3, '0')}
                  </span>

                  <div className="w-11 h-11 rounded-xl bg-black/70 p-1 flex items-center justify-center border border-white/[0.08] shrink-0">
                    <img
                      src={activeChannel.logoUrl}
                      alt={activeChannel.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow"
                    />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-black text-white truncate">
                        {activeChannel.name}
                      </h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-600 text-white font-black uppercase">
                        AO VIVO
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold uppercase hidden sm:inline">
                        1080p FHD
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-300 mt-0.5">
                      <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="font-semibold truncate">
                        {activeChannel.currentShow?.title || 'Programação Ao Vivo'}
                      </span>
                      <span className="text-slate-500 font-mono hidden sm:inline">
                        ({activeChannel.currentShow?.startTime || '19:00'} -{' '}
                        {activeChannel.currentShow?.endTime || '21:30'})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right controls: Server Switcher + Zap buttons + Volume + Fullscreen */}
                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {/* Server selector */}
                  <div className="flex items-center gap-1 bg-black/50 p-1 rounded-xl border border-white/[0.06]">
                    <Server className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
                    {currentSources.map((s, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setServerIndex(idx);
                          setHasError(false);
                          setIsBuffering(true);
                        }}
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

                  {/* Volume Toggle */}
                  <button
                    onClick={toggleMute}
                    className="p-2 rounded-xl bg-black/50 border border-white/[0.08] text-slate-300 hover:text-white"
                    title={isMuted ? 'Ativar Som' : 'Silenciar'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-cyan-400" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Channel zap navigation */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={zapPrev}
                      className="p-2 rounded-xl bg-black/50 border border-white/[0.08] text-slate-300 hover:text-white"
                      title="Canal Anterior (Seta Cima)"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={zapNext}
                      className="p-2 rounded-xl bg-black/50 border border-white/[0.08] text-slate-300 hover:text-white"
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
