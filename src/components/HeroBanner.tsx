import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { MediaItem } from '../types';
import { Play, Info, Plus, Check, Star, Sparkles, Volume2, VolumeX } from 'lucide-react';

interface HeroBannerProps {
  items: MediaItem[];
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ items }) => {
  const { openPlayer, openDetail, toggleFavorite, isFavorite } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate every 8 seconds
  useEffect(() => {
    if (!items || items.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items]);

  if (!items || items.length === 0) return null;

  const currentItem = items[currentIndex];
  const favorited = isFavorite(currentItem.id);

  const handlePlay = () => {
    if (currentItem.seasons && currentItem.seasons.length > 0) {
      const firstEp = currentItem.seasons[0].episodes[0];
      openPlayer(currentItem, firstEp, 1);
    } else {
      openPlayer(currentItem);
    }
  };

  return (
    <div className="relative w-full h-[70vh] sm:h-[80vh] min-h-[500px] max-h-[750px] overflow-hidden select-none">
      {/* Background image & gradient blends */}
      <div className="absolute inset-0">
        <img
          src={currentItem.backdropUrl || currentItem.posterUrl}
          alt={currentItem.title}
          className="w-full h-full object-cover object-center transition-all duration-1000 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#070913] via-[#070913]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070913] via-[#070913]/80 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/20 via-transparent to-transparent" />
      </div>

      {/* Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-12 sm:pb-16">
        <div className="max-w-2xl space-y-4">
          {/* Badge & Meta */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-2.5 py-1 rounded-md text-xs font-bold tracking-wide uppercase bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Destaque Sirius
            </span>

            {currentItem.type === 'dorama' && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-500/30 text-purple-300 border border-purple-500/40">
                {currentItem.country || 'Dorama'}
              </span>
            )}

            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <span>{currentItem.rating.toFixed(1)}</span>
            </div>

            <span className="text-xs font-medium text-slate-300">
              {currentItem.releaseYear}
            </span>

            {currentItem.duration && (
              <span className="text-xs font-medium text-slate-400">
                • {currentItem.duration}
              </span>
            )}

            {currentItem.audio && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {currentItem.audio.join(' / ')}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-md">
            {currentItem.title}
          </h1>

          {currentItem.originalTitle && currentItem.originalTitle !== currentItem.title && (
            <p className="text-xs sm:text-sm text-cyan-300/80 font-mono -mt-2">
              {currentItem.originalTitle}
            </p>
          )}

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 sm:line-clamp-4 leading-relaxed max-w-xl text-shadow-sm">
            {currentItem.overview}
          </p>

          {/* Genres */}
          <div className="flex flex-wrap gap-2 pt-1">
            {currentItem.genres.map((g) => (
              <span
                key={g}
                className="text-xs text-slate-400 bg-slate-900/60 backdrop-blur-sm px-2.5 py-1 rounded-full border border-slate-800"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <button
              onClick={handlePlay}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm sm:text-base flex items-center gap-2 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-400/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Play className="w-5 h-5 fill-slate-950" />
              <span>Assistir Agora</span>
            </button>

            <button
              onClick={() => openDetail(currentItem)}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700/80 font-semibold text-sm sm:text-base flex items-center gap-2 backdrop-blur-md transition-all duration-200"
            >
              <Info className="w-5 h-5 text-cyan-400" />
              <span>Detalhes</span>
            </button>

            <button
              onClick={() => toggleFavorite(currentItem.id)}
              className={`p-3 rounded-xl border transition-all duration-200 ${
                favorited
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-md shadow-rose-500/20'
                  : 'bg-slate-900/80 border-slate-700/80 text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
              title={favorited ? 'Remover da Minha Lista' : 'Adicionar à Minha Lista'}
            >
              {favorited ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="absolute bottom-6 right-6 flex items-center gap-2">
          {items.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 transition-all duration-300 rounded-full ${
                idx === currentIndex ? 'w-8 bg-cyan-400 shadow-sm shadow-cyan-400' : 'w-2 bg-slate-600 hover:bg-slate-400'
              }`}
              aria-label={`Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
