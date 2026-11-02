import React, { useEffect, useRef, useState, useMemo } from 'react';
import Hls from 'hls.js';
import { useApp } from '../context/AppContext';
import { MediaItem, Channel, StreamSource } from '../types';
import {
  X,
  Maximize2,
  Minimize2,
  Server,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Radio,
  Tv,
  ListVideo,
  Play,
  Pause,
  Volume2,
  VolumeX,
  RotateCcw,
} from 'lucide-react';

export const VideoPlayerModal: React.FC = () => {
  const { playerState, closePlayer, switchServer, openPlayer } = useApp();

  // All Hooks MUST be at the top unconditionally
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isBuffering, setIsBuffering] = useState(false);

  const { isOpen, item, episode, seasonNumber, serverIndex } = playerState;

  // Compute stream sources safely
  const sources: StreamSource[] = useMemo(() => {
    if (!item) return [];

    if (episode && episode.sources && episode.sources.length > 0) {
      return episode.sources;
    }

    if ('sources' in item && Array.isArray(item.sources) && item.sources.length > 0) {
      return (item as any).sources.map((src: any, idx: number) => {
        if (typeof src === 'string') {
          return {
            name: `Servidor ${idx + 1}`,
            url: src,
            type: src.includes('.m3u8') ? 'hls' : 'embed',
          };
        }
        return src;
      });
    }

    return [{ name: 'Servidor Principal', url: '', type: 'embed' }];
  }, [item, episode]);

  const activeSource = sources[serverIndex] || sources[0];

  // HLS and Video Initialization Hook
  useEffect(() => {
    if (!isOpen || !item || !activeSource?.url) return;

    setHasError(false);
    setErrorMessage('');
    setIsBuffering(true);

    const video = videoRef.current;
    if (!video) return;

    // Cleanup any existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const isDirectHls =
      activeSource.type === 'hls' ||
      activeSource.url.includes('.m3u8') ||
      activeSource.url.includes('/playlist');

    if (isDirectHls) {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
          manifestLoadingTimeOut: 10000,
          manifestLoadingMaxRetry: 3,
          levelLoadingTimeOut: 10000,
        });
        hlsRef.current = hls;

        hls.loadSource(activeSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          setIsBuffering(false);
          video.play().catch(() => {
            // Autoplay with sound may be blocked by browser; user can click play
            setIsPlaying(false);
          });
        });

        hls.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                console.warn('[Sirius Video] Erro de rede HLS, tentando recuperar...');
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.warn('[Sirius Video] Erro de mídia HLS, recuperando...');
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                setHasError(true);
                setErrorMessage('Transmissão offline ou bloqueada neste servidor.');
                setIsBuffering(false);
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native Safari / iOS support
        video.src = activeSource.url;
        video.play().catch(() => setIsPlaying(false));
      } else {
        setHasError(true);
        setErrorMessage('Navegador sem suporte a HLS nativo.');
      }
    } else if (activeSource.type === 'mp4') {
      video.src = activeSource.url;
      video.play().catch(() => setIsPlaying(false));
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [isOpen, item, activeSource]);

  // Video time tracking
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      setIsBuffering(false);
    };
    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => {
      setIsBuffering(false);
      setIsPlaying(true);
    };
    const onPause = () => setIsPlaying(false);

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
    };
  }, [isOpen]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

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

  const seek = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.currentTime + seconds, video.duration || 0));
  };

  // Series/Doramas episode navigation
  const isSeriesOrDorama = !!(item && 'seasons' in item && item.seasons && item.seasons.length > 0);
  const allEpisodes = useMemo(() => {
    if (!isSeriesOrDorama || !item) return [];
    const list: { ep: any; sNum: number }[] = [];
    (item as MediaItem).seasons!.forEach((s) => {
      s.episodes.forEach((e) => {
        list.push({ ep: e, sNum: s.seasonNumber });
      });
    });
    return list;
  }, [isSeriesOrDorama, item]);

  const currentEpIndex = allEpisodes.findIndex((e) => e.ep.id === episode?.id);
  const prevEp = currentEpIndex > 0 ? allEpisodes[currentEpIndex - 1] : null;
  const nextEp = currentEpIndex >= 0 && currentEpIndex < allEpisodes.length - 1 ? allEpisodes[currentEpIndex + 1] : null;

  // ONLY return null when isOpen is false AFTER all hooks have executed!
  if (!isOpen || !item) {
    return null;
  }

  const titleText = episode
    ? `${'title' in item ? item.title : item.name} - T${seasonNumber} E${episode.episodeNumber}`
    : 'name' in item
    ? item.name
    : item.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-2xl p-0 sm:p-2 lg:p-4 animate-in fade-in duration-200 select-none">
      <div
        ref={containerRef}
        className="relative w-full h-full max-w-7xl max-h-[100vh] sm:max-h-[96vh] flex flex-col bg-[#05070f] border border-slate-800/80 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-slate-950/95 border-b border-slate-800/80 z-30">
          <div className="flex items-center gap-3 min-w-0">
            {'category' in item ? (
              <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 flex items-center gap-1.5 shrink-0">
                <Radio className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-wider hidden sm:inline">Ao Vivo</span>
              </span>
            ) : (
              <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
                <Tv className="w-4 h-4" />
              </span>
            )}

            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-white truncate">
                {titleText}
              </h2>
              {episode?.title && (
                <p className="text-xs text-slate-400 truncate">
                  {episode.title}
                </p>
              )}
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {isSeriesOrDorama && (
              <button
                onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                className={`p-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                  showEpisodeDrawer
                    ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                }`}
                title="Lista de Episódios"
              >
                <ListVideo className="w-4 h-4" />
                <span className="hidden md:inline">Episódios</span>
              </button>
            )}

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="Tela cheia"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              onClick={closePlayer}
              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/30 text-rose-400 transition-colors"
              title="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="relative w-full flex-1 bg-black flex items-center justify-center overflow-hidden group">
          {hasError ? (
            <div className="p-6 text-center max-w-md space-y-4 z-20">
              <div className="w-14 h-14 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/20">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-white">Transmissão indisponível neste servidor</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {errorMessage || 'Tente mudar para outro servidor abaixo.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {sources.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchServer(idx)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      idx === serverIndex
                        ? 'bg-cyan-400 text-slate-950 shadow-md shadow-cyan-400/30'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    Tentar {s.name}
                  </button>
                ))}
              </div>
            </div>
          ) : activeSource?.type === 'embed' ? (
            <iframe
              src={activeSource.url}
              title={titleText}
              className="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-contain cursor-pointer"
                onClick={togglePlay}
                playsInline
                onError={() => {
                  setHasError(true);
                  setErrorMessage('Falha ao carregar fluxo de vídeo.');
                }}
              />

              {/* Buffering Spinner */}
              {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 pointer-events-none">
                  <div className="w-12 h-12 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin" />
                </div>
              )}
            </>
          )}

          {/* Episode Drawer Sidebar */}
          {showEpisodeDrawer && isSeriesOrDorama && (
            <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 p-4 overflow-y-auto z-40 animate-in slide-in-from-right duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="font-bold text-sm text-white">Episódios</h4>
                <button
                  onClick={() => setShowEpisodeDrawer(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {allEpisodes.map(({ ep, sNum }) => {
                  const isCurrent = ep.id === episode?.id;
                  return (
                    <button
                      key={ep.id}
                      onClick={() => {
                        openPlayer(item, ep, sNum);
                        setShowEpisodeDrawer(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl text-xs transition-colors flex items-center justify-between ${
                        isCurrent
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                          : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <span className="block font-medium truncate">
                          T{sNum} E{ep.episodeNumber}: {ep.title}
                        </span>
                        {ep.duration && (
                          <span className="text-[10px] text-slate-400">{ep.duration}</span>
                        )}
                      </div>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-400 text-slate-950 font-black">
                          Atual
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Control Bar */}
        <div className="p-3 sm:p-4 bg-slate-950/95 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs z-30">
          {/* Playback Controls (if not embed) */}
          {activeSource?.type !== 'embed' && (
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-colors"
                title={isPlaying ? 'Pausar' : 'Reproduzir'}
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current translate-x-0.5" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title={isMuted ? 'Desmutar' : 'Mutar'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>

              <button
                onClick={() => seek(-10)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
                title="Voltar 10s"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Server Switchers */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold shrink-0">
              <Server className="w-3.5 h-3.5 text-cyan-400" />
              <span>Servidores:</span>
            </span>

            {sources.map((s, idx) => (
              <button
                key={idx}
                onClick={() => switchServer(idx)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-all ${
                  idx === serverIndex
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-sm shadow-cyan-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700/80'
                }`}
              >
                {s.name || `Servidor ${idx + 1}`}
              </button>
            ))}
          </div>

          {/* Series Episode Navigation */}
          {isSeriesOrDorama && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                disabled={!prevEp}
                onClick={() => prevEp && openPlayer(item, prevEp.ep, prevEp.sNum)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-300 border border-slate-800 flex items-center gap-1"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Episódio Anterior</span>
              </button>

              <button
                disabled={!nextEp}
                onClick={() => nextEp && openPlayer(item, nextEp.ep, nextEp.sNum)}
                className="px-3 py-1.5 rounded-xl bg-cyan-400/20 hover:bg-cyan-400 hover:text-slate-950 text-cyan-300 font-bold border border-cyan-400/40 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-1 transition-colors"
              >
                <span>Próximo Episódio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
