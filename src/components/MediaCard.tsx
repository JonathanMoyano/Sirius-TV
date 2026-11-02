import React from 'react';
import { MediaItem } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Star, Plus, Check } from 'lucide-react';

interface MediaCardProps {
  item: MediaItem;
}

export const MediaCard: React.FC<MediaCardProps> = ({ item }) => {
  const { openDetail, openPlayer, toggleFavorite, isFavorite } = useApp();
  const favorited = isFavorite(item.id);

  const handlePlayQuick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (item.seasons && item.seasons.length > 0) {
      const firstEp = item.seasons[0].episodes[0];
      openPlayer(item, firstEp, 1);
    } else {
      openPlayer(item);
    }
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(item.id);
  };

  return (
    <div
      onClick={() => openDetail(item)}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/40 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer select-none"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-slate-800">
        <img
          src={item.posterUrl}
          alt={item.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // fallback placeholder if remote image 404s
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1578328819058-b69f3a3b0f6b?auto=format&fit=crop&w=500&q=80';
          }}
        />

        {/* Hover overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
          {/* Top badges */}
          <div className="flex items-center justify-between">
            {item.country && (
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-purple-600/80 text-white shadow">
                {item.country}
              </span>
            )}
            <button
              onClick={handleFavoriteToggle}
              className={`p-1.5 rounded-full backdrop-blur-md transition-colors ${
                favorited
                  ? 'bg-rose-500 text-white'
                  : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
              }`}
              title={favorited ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            >
              {favorited ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Center Play Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={handlePlayQuick}
              className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/40 hover:scale-110 active:scale-95 transition-transform duration-200"
              title="Assistir Agora"
            >
              <Play className="w-6 h-6 fill-slate-950 translate-x-0.5" />
            </button>
          </div>

          {/* Bottom genres preview */}
          <div className="flex flex-wrap gap-1">
            {item.genres.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-[10px] text-slate-200 bg-slate-900/80 px-2 py-0.5 rounded-md"
              >
                {g}
              </span>
            ))}
          </div>
        </div>

        {/* Top Badges (Always Visible) */}
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 pointer-events-none">
          <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-bold bg-black/70 backdrop-blur-md text-amber-300 border border-amber-500/20">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span>{item.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Audio badge bottom right */}
        {item.audio && item.audio.length > 0 && (
          <div className="absolute bottom-2.5 right-2.5 pointer-events-none group-hover:opacity-0 transition-opacity">
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-black/75 backdrop-blur-sm text-cyan-300 border border-cyan-500/20">
              {item.audio.includes('Dublado') ? 'DUB' : 'LEG'}
            </span>
          </div>
        )}
      </div>

      {/* Info Info */}
      <div className="p-3 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-semibold text-sm text-white line-clamp-1 group-hover:text-cyan-400 transition-colors">
            {item.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <span>{item.releaseYear}</span>
            <span>•</span>
            <span>{item.type === 'movie' ? 'Filme' : item.type === 'dorama' ? 'Dorama' : 'Série'}</span>
            {item.duration && (
              <>
                <span>•</span>
                <span>{item.duration}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

