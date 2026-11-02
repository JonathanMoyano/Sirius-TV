import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useApp } from '../context/AppContext';
import { Channel, MediaItem, StreamSource } from '../types';
import {
  X,
  Maximize2,
  Minimize2,
  Server,
  AlertTriangle,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Radio,
  Tv,
  ListVideo,
} from 'lucide-react';

export const VideoPlayerModal: React.FC = () => {
  const { playerState, closePlayer, switchServer, openPlayer } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);

  const { isOpen, item, episode, seasonNumber, serverIndex } = playerState;

  if (!isOpen || !item) return null;

  // Determine available sources
  let sources: StreamSource[] = [];
  if (episode && episode.sources && episode.sources.length > 0) {
    sources = episode.sources;
  } else if ('sources' in item && item.sources && item.sources.length > 0) {
    sources = item.sources;
  } else {
    sources = [{ name: 'Servidor Principal', url: '', type: 'embed' }];
  }

  const activeSource = sources[serverIndex] || sources[0];

  // Initialize or update Video / Hls player
  useEffect(() => {
    setHasError(false);
    setErrorMessage('');

    if (activeSource?.type !== 'hls' && activeSource?.type !== 'mp4') {
      // Destroy previous HLS instance if switching to embed
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      return;
    }

    const video = videoRef.current;
    if (!video || !activeSource?.url) return;

    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (activeSource.type === 'hls') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90,
        });
        hlsRef.current = hls;

        hls.loadSource(activeSource.url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play().catch(() => {
            // Autoplay with sound may be blocked by browser policy; user can click play
          });
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
                setErrorMessage('Falha ao conectar à transmissão deste servidor.');
                break;
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS for Safari / iOS
        video.src = activeSource.url;
        video.addEventListener('loadedmetadata', () => {
          video.play().catch(() => {});
        });
      } else {
        setHasError(true);
        setErrorMessage('Seu navegador não suporta reprodução HLS direta.');
      }
    } else if (activeSource.type === 'mp4') {
      video.src = activeSource.url;
      video.play().catch(() => {});
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [activeSource]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  // Series navigation: Next / Previous episode
  const isSeriesOrDorama = 'seasons' in item && item.seasons && item.seasons.length > 0;
  let allEpisodes: { ep: any; sNum: number }[] = [];
  if (isSeriesOrDorama && (item as MediaItem).seasons) {
    (item as MediaItem).seasons!.forEach((s) => {
      s.episodes.forEach((e) => {
        allEpisodes.push({ ep: e, sNum: s.seasonNumber });
      });
    });
  }

  const currentEpIndex = allEpisodes.findIndex((e) => e.ep.id === episode?.id);
  const prevEp = currentEpIndex > 0 ? allEpisodes[currentEpIndex - 1] : null;
  const nextEp = currentEpIndex >= 0 && currentEpIndex < allEpisodes.length - 1 ? allEpisodes[currentEpIndex + 1] : null;

  const titleText = episode
    ? `${'title' in item ? item.title : item.name} - T${seasonNumber} E${episode.episodeNumber}`
    : 'name' in item
    ? item.name
    : item.title;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-2 sm:p-4 lg:p-6 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="relative w-full max-w-6xl max-h-[96vh] flex flex-col bg-[#070913] border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden"
      >
        {/* Top Bar / Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-950/90 border-b border-slate-800/80 z-20">
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

          {/* Action buttons */}
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
              title="Fechar player"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Player Display Area */}
        <div className="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
          {hasError ? (
            <div className="p-6 text-center max-w-md space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">Transmissão indisponível neste servidor</h3>
              <p className="text-xs sm:text-sm text-slate-400">
                {errorMessage || 'Tente mudar para outro servidor abaixo ou abrir no player externo.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                {sources.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => switchServer(idx)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      idx === serverIndex
                        ? 'bg-cyan-400 text-slate-950'
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
            <video
              ref={videoRef}
              className="w-full h-full object-contain"
              controls
              playsInline
              onError={() => {
                setHasError(true);
                setErrorMessage('Falha ao carregar o fluxo de vídeo.');
              }}
            />
          )}

          {/* Episode Drawer Sidebar Overlay (for series/doramas) */}
          {showEpisodeDrawer && isSeriesOrDorama && (
            <div className="absolute top-0 right-0 bottom-0 w-80 bg-slate-950/95 backdrop-blur-xl border-l border-slate-800 p-4 overflow-y-auto z-30 animate-in slide-in-from-right duration-200">
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

        {/* Bottom Control Bar: Server Switcher & Episode Navigation */}
        <div className="p-3 sm:p-4 bg-slate-950/90 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Server Selectors */}
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
                {s.name}
              </button>
            ))}
          </div>

          {/* Previous / Next Episode buttons */}
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
