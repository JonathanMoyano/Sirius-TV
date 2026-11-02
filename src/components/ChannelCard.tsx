import React, { useState } from 'react';
import { Channel } from '../types';
import { useApp } from '../context/AppContext';
import { Star, Play } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const { openPlayer, toggleFavorite, isFavorite } = useApp();
  const favorited = isFavorite(channel.id);
  const [imgError, setImgError] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  const thumb =
    channel.thumbUrl ||
    'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=640&q=80';

  return (
    <div
      tabIndex={0}
      onClick={() => openPlayer(channel)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') openPlayer(channel);
      }}
      className="group relative flex flex-col rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800/90 hover:border-cyan-500/60 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400 transition-all duration-300 hover:shadow-2xl hover:shadow-cyan-500/10 cursor-pointer select-none"
    >
      {/* 16:9 Thumbnail Banner (Estilo Saimo/UniTV) */}
      <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
        <img
          src={imgError ? 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?auto=format&fit=crop&w=640&q=80' : thumb}
          alt={channel.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setImgError(true)}
        />

        {/* Gradient dark overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />

        {/* Top-Left: Channel Logo Badge */}
        <div className="absolute top-2.5 left-2.5 z-10 w-11 h-11 rounded-xl bg-black/75 backdrop-blur-md p-1.5 flex items-center justify-center border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
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

        {/* Top-Right: AO VIVO Badge & Favorite */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-600/90 text-white shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            AO VIVO
          </span>

          <button
            onClick={handleFavorite}
            className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
              favorited
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                : 'bg-black/60 text-slate-300 hover:text-white hover:bg-black/80'
            }`}
            title={favorited ? 'Remover dos favoritos' : 'Favoritar'}
          >
            <Star className={`w-3.5 h-3.5 ${favorited ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Center Hover Play Icon */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="w-12 h-12 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/40 transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-5 h-5 fill-slate-950 translate-x-0.5" />
          </span>
        </div>
      </div>

      {/* Bottom Info Bar with Green Progress Track */}
      <div className="p-3.5 flex flex-col justify-between flex-1 bg-slate-900/90">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-white group-hover:text-cyan-400 transition-colors truncate">
              {channel.name}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium shrink-0">
              {channel.category}
            </span>
          </div>

          <p className="text-xs text-slate-300 truncate mt-0.5">
            {channel.currentShow?.title || 'Programação Ao Vivo'}
          </p>
        </div>

        {/* Saimo-style Green Progress Bar */}
        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden mt-2.5">
          <div
            className="h-full bg-emerald-400 rounded-full transition-all duration-500 shadow-sm shadow-emerald-400/50"
            style={{ width: `${Math.min(100, Math.max(10, channel.currentShow?.progressPercent || 40))}%` }}
          />
        </div>
      </div>
    </div>
  );
};
