import React, { useState, useEffect, useRef, useMemo } from 'react';
import Hls from 'hls.js';
import { Channel, StreamSource } from '../types';
import { useApp } from '../context/AppContext';
import {
  Star,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronRight,
  Tv,
  Layers,
  Sparkles,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ChannelPlayerViewProps {
  channel: Channel;
  onSelectChannel: (channel: Channel) => void;
  onBackToGrid: () => void;
  onOpenUniTvMode?: () => void;
}

export const ChannelPlayerView: React.FC<ChannelPlayerViewProps> = ({
  channel,
  onSelectChannel,
  onBackToGrid,
  onOpenUniTvMode,
}) => {
  const { allChannels, favorites, toggleFavorite, isFavorite, setCurrentTab } = useApp();
  const isFav = isFavorite(channel.id);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [serverIndex, setServerIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sources available for the channel
  const sources: StreamSource[] = useMemo(() => {
    if (channel.sources && channel.sources.length > 0) {
      return channel.sources;
    }
    return [{ name: 'Servidor 1', url: '', type: 'hls' }];
  }, [channel]);

  const activeSource = sources[serverIndex] || sources[0];

  // Related channels from the same category
  const relatedChannels = useMemo(() => {
    return allChannels
      .filter((c) => c.category === channel.category && c.id !== channel.id)
      .slice(0, 10);
  }, [allChannels, channel]);

  // Video and HLS initialization
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');
    setIsBuffering(true);

    const video = videoRef.current;
    if (!video) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (!activeSource?.url) {
      setHasError(true);
      setErrorMessage('Nenhum link disponível para este servidor.');
      setIsBuffering(false);
      return;
    }

    const rawUrl = activeSource.url;
    const isDirectHls =
      activeSource.type === 'hls' || rawUrl.includes('.m3u8') || rawUrl.includes('/playlist');

    if (isDirectHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingTimeOut: 12000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 12000,
        });

        hlsRef.current = hls;

        const loadWithProxyFallback = (targetUrl: string, isFallback = false) => {
          hls.loadSource(targetUrl);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setIsBuffering(false);
            setHasError(false);
            video.play().catch(() => {});
          });

          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  if (!isFallback && !targetUrl.startsWith('/api/proxy')) {
                    console.log('Direct HLS failed, trying proxy fallback...');
                    hls.destroy();
                    const proxyHls = new Hls({ enableWorker: true });
                    hlsRef.current = proxyHls;
                    loadWithProxyFallback(`/api/proxy?url=${encodeURIComponent(rawUrl)}`, true);
                    return;
                  }
                  setHasError(true);
                  setErrorMessage('Erro de conexão com o servidor. Tente outro servidor.');
                  setIsBuffering(false);
                  hls.destroy();
                  break;
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError();
                  break;
                default:
                  setHasError(true);
                  setErrorMessage('Erro ao reproduzir stream.');
                  setIsBuffering(false);
                  hls.destroy();
                  break;
              }
            }
          });
        };

        loadWithProxyFallback(rawUrl);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = rawUrl;
        video.play().catch(() => {});
      }
    } else {
      video.src = rawUrl;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [channel, activeSource]);

  // Video listeners
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play();
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const toggleFullscreen = () => {
    if (!playerContainerRef.current) return;
    if (!document.fullscreenElement) {
      playerContainerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const currentProgramTitle = channel.currentShow?.title || 'Programação Ao Vivo';
  const currentStartTime = channel.currentShow?.startTime || '19:00';
  const currentEndTime = channel.currentShow?.endTime || '21:30';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 space-y-8 animate-fadeIn">
      {/* 1. Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
        <button
          onClick={() => setCurrentTab('home')}
          className="hover:text-cyan-400 transition-colors"
        >
          Início
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button
          onClick={onBackToGrid}
          className="hover:text-cyan-400 transition-colors"
        >
          TV Ao Vivo
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-slate-300 font-medium">{channel.category}</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-400 font-bold">{channel.name}</span>
      </nav>

      {/* Main 2-Column Layout: Left Video & Schedule, Right Related Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: Video Player + Channel Info + Schedule */}
        <div className="lg:col-span-2 space-y-6">
          {/* 2. Video Player matching Screenshot 4 */}
          <div
            ref={playerContainerRef}
            className="group relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl"
          >
            {/* Top Bar Overlay: Live Badge + Program + Server Buttons */}
            <div className="absolute top-0 left-0 right-0 z-20 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider uppercase bg-rose-600 text-white shadow-lg">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                  AO VIVO
                </span>
                <span className="text-xs sm:text-sm font-bold text-white truncate drop-shadow">
                  {currentProgramTitle}
                </span>
              </div>

              {/* Server Switcher Pills */}
              <div className="flex items-center gap-1.5 shrink-0">
                {sources.map((src, idx) => (
                  <button
                    key={idx}
                    onClick={() => setServerIndex(idx)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-md ${
                      serverIndex === idx
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-emerald-500/30'
                        : 'bg-slate-900/80 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60'
                    }`}
                  >
                    Servidor {idx + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Video Element */}
            <video
              ref={videoRef}
              className="w-full h-full object-contain cursor-pointer"
              onClick={togglePlay}
              playsInline
              autoPlay
            />

            {/* Buffering Indicator */}
            {isBuffering && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none">
                <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                <span className="mt-3 text-xs font-semibold text-cyan-200">
                  Carregando sinal ao vivo...
                </span>
              </div>
            )}

            {/* Error Overlay */}
            {hasError && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/90">
                <AlertCircle className="w-12 h-12 text-rose-500 mb-3" />
                <h4 className="text-base font-bold text-white mb-1">
                  Falha ao reproduzir este sinal
                </h4>
                <p className="text-xs text-slate-400 max-w-sm mb-4">
                  {errorMessage || 'O canal pode estar temporariamente fora do ar. Experimente outro servidor.'}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {sources.length > 1 && (
                    <button
                      onClick={() => setServerIndex((serverIndex + 1) % sources.length)}
                      className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Trocar de Servidor</span>
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setHasError(false);
                      setIsBuffering(true);
                      const s = serverIndex;
                      setServerIndex(0);
                      setTimeout(() => setServerIndex(s), 50);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all"
                  >
                    Tentar Novamente
                  </button>
                </div>
              </div>
            )}

            {/* Hover Bottom Video Controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={togglePlay}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white" />}
                </button>
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {onOpenUniTvMode && (
                  <button
                    onClick={onOpenUniTvMode}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                    title="Entrar no modo TV com controle remoto"
                  >
                    <Tv className="w-3.5 h-3.5" />
                    <span>Modo TV Box</span>
                  </button>
                )}
                <button
                  onClick={toggleFullscreen}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-all"
                >
                  {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* 3. Channel Title, Subtitle and Actions */}
          <div className="flex items-start justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-black/60 p-2 border border-slate-700/60 flex items-center justify-center shrink-0 shadow-lg">
                <img
                  src={channel.logoUrl}
                  alt={channel.name}
                  className="max-h-full max-w-full object-contain filter drop-shadow"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://via.placeholder.com/80x80?text=' + encodeURIComponent(channel.name);
                  }}
                />
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3">
                  <span>{channel.name} Ao Vivo</span>
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Assista {channel.name} ao vivo online no Sirius TV. Agora:{' '}
                  <strong className="text-slate-200">{currentProgramTitle}</strong> ({currentStartTime}–{currentEndTime}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => toggleFavorite(channel.id)}
                className={`p-3 rounded-xl border transition-all flex items-center gap-2 text-xs font-bold ${
                  isFav
                    ? 'bg-amber-400/10 text-amber-300 border-amber-400/40 shadow-lg shadow-amber-400/10'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800'
                }`}
                title={isFav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
              >
                <Star className={`w-4 h-4 ${isFav ? 'fill-current text-amber-400' : ''}`} />
                <span className="hidden sm:inline">{isFav ? 'Favorito' : 'Favoritar'}</span>
              </button>
            </div>
          </div>

          {/* 4. "Programação de Hoje" Schedule Section */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">Programação de Hoje</h2>
              <p className="text-xs text-slate-400">
                O que passa no {channel.name} hoje, no horário de Brasília.
              </p>
            </div>

            <div className="space-y-3">
              {(channel.schedule && channel.schedule.length > 0
                ? channel.schedule
                : [
                    { time: '14:00', title: 'Programa da Tarde', description: 'Assuntos do dia a dia e reportagens especiais.' },
                    { time: '16:00', title: 'Brasil Urgente', description: 'Os acontecimentos do dia, com foco na segurança e no trabalho.' },
                    { time: currentStartTime, title: `${currentProgramTitle} - agora`, description: channel.currentShow?.description || 'Noticiário diário que apresenta os principais acontecimentos no Brasil e no Mundo com neutralidade.', isCurrent: true },
                    { time: '21:00', title: 'Sessão Especial', description: 'Grandes sucessos do cinema nacional e internacional.' },
                    { time: '23:30', title: 'Jornal da Noite', description: 'Resumo dos fatos que marcaram o dia.' },
                  ]
              ).map((prog: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border transition-all ${
                    prog.isCurrent
                      ? 'bg-cyan-950/20 border-cyan-500/40 shadow-md shadow-cyan-500/5'
                      : 'bg-slate-900/60 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs sm:text-sm font-mono font-bold text-slate-400 shrink-0">
                      {prog.time}
                    </span>
                    <h3
                      className={`text-sm sm:text-base font-bold ${
                        prog.isCurrent ? 'text-cyan-300' : 'text-white'
                      }`}
                    >
                      {prog.title}
                    </h3>
                    {prog.isCurrent && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-cyan-400/20 text-cyan-300 border border-cyan-400/40">
                        No Ar
                      </span>
                    )}
                  </div>
                  {prog.description && (
                    <p className="text-xs text-slate-400 mt-1 pl-12 line-clamp-2">
                      {prog.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Sidebar matching Screenshot 4 */}
        <div className="space-y-6">
          {/* Sirius TV Premium Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-purple-950/30 to-slate-950 border border-indigo-500/30 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-15">
              <Sparkles className="w-20 h-20 text-cyan-400" />
            </div>
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] uppercase font-black tracking-widest text-cyan-400">
                Sirius TV
              </span>
              <h3 className="text-base font-black text-white">
                Transmissão Estável Full HD
              </h3>
              <p className="text-xs text-slate-300">
                Sem travamentos, com múltiplos servidores de backup e compatível com TV Box e celulares.
              </p>
            </div>
          </div>

          {/* "Outros canais de {categoria}" Header & Channel List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200">
              Outros canais de {channel.category}
            </h3>

            <div className="space-y-2.5">
              {relatedChannels.map((relChannel) => (
                <div
                  key={relChannel.id}
                  onClick={() => onSelectChannel(relChannel)}
                  className="group p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all flex items-center gap-3.5 shadow-sm hover:shadow-lg"
                >
                  <div className="w-11 h-11 rounded-lg bg-black/60 p-1.5 border border-slate-700/60 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    <img
                      src={relChannel.logoUrl}
                      alt={relChannel.name}
                      className="max-h-full max-w-full object-contain filter drop-shadow"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/60x60?text=' + encodeURIComponent(relChannel.name);
                      }}
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                      {relChannel.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {relChannel.currentShow?.title || 'Programação Ao Vivo'}
                    </p>

                    {/* Saimo green progress bar */}
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-400 rounded-full shadow-sm shadow-emerald-400/50"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(15, relChannel.currentShow?.progressPercent || 40)
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
