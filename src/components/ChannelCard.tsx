import React from 'react';
import { Channel } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Radio, Plus, Check, Clock } from 'lucide-react';

interface ChannelCardProps {
  channel: Channel;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ channel }) => {
  const { openPlayer, toggleFavorite, isFavorite } = useApp();
  const favorited = isFavorite(channel.id);

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(channel.id);
  };

  return (
    <div
      onClick={() => openPlayer(channel)}
      className="group relative flex flex-col justify-between p-4 rounded-2xl bg-gradient-to-br from-slate-900/80 via-slate-900/50 to-slate-950/80 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer select-none"
    >
      {/* Top Header: Channel Logo + Live Badge + Favorite */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-slate-800/90 p-2 flex items-center justify-center border border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform">
            <img
              src={channel.logoUrl}
              alt={channel.name}
              className="max-w-full max-h-full object-contain filter drop-shadow"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://via.placeholder.com/100x100?text=' + encodeURIComponent(channel.name);
              }}
            />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="text-[10px] font-black tracking-widest text-rose-500 uppercase">
                AO VIVO
              </span>
            </div>
            <h3 className="font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
              {channel.name}
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">
              {channel.category}
            </span>
          </div>
        </div>

        <button
          onClick={handleFavorite}
          className={`p-2 rounded-xl transition-all ${
            favorited
              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
              : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          title={favorited ? 'Remover dos favoritos' : 'Favoritar canal'}
        >
          {favorited ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      </div>

      {/* Program Info & Progress */}
      <div className="mt-4 pt-3 border-t border-slate-800/60 space-y-2">
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-200 line-clamp-1">
              {channel.currentShow.title}
            </span>
            <span className="text-[11px] text-slate-400 shrink-0 font-mono">
              {channel.currentShow.startTime} - {channel.currentShow.endTime}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${channel.currentShow.progressPercent}%` }}
            />
          </div>
        </div>

        {/* Next Show Preview */}
        <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-1">
          <Clock className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="truncate">
            <strong className="text-slate-300 font-medium">A seguir:</strong> {channel.nextShow.title} ({channel.nextShow.startTime})
          </span>
        </div>
      </div>

      {/* Floating Play Action on Hover */}
      <div className="absolute right-4 bottom-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="p-2.5 rounded-full bg-cyan-400 text-slate-950 flex items-center justify-center shadow-lg shadow-cyan-400/30">
          <Play className="w-4 h-4 fill-slate-950 translate-x-0.5" />
        </span>
      </div>
    </div>
  );
};

