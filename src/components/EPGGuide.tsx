import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Radio, Clock, Sparkles } from 'lucide-react';

export const EPGGuide: React.FC = () => {
  const { allChannels, openPlayer } = useApp();
  const [selectedCat, setSelectedCat] = useState<string>('Todos');

  const categories = ['Todos', 'TV Aberta', 'Esportes', 'Filmes e Séries', 'Notícias', 'Infantil', 'Documentários'];

  const filtered = selectedCat === 'Todos'
    ? allChannels
    : allChannels.filter((c) => c.category === selectedCat);

  return (
    <div className="w-full bg-[#080b18] border border-slate-800/80 rounded-3xl p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-rose-500 animate-pulse" />
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Guia de Programação & TV Ao Vivo
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Confira o que está passando agora nos canais e sintonize em alta definição.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                selectedCat === cat
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Channels Grid / Table */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((channel) => (
          <div
            key={channel.id}
            onClick={() => openPlayer(channel)}
            className="group flex flex-col justify-between p-4 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all duration-200"
          >
            {/* Top row */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-800 p-1.5 flex items-center justify-center shrink-0">
                  <img
                    src={channel.logoUrl}
                    alt={channel.name}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white group-hover:text-cyan-300 transition-colors">
                    {channel.name}
                  </h4>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {channel.category}
                  </span>
                </div>
              </div>

              <span className="p-1.5 rounded-lg bg-cyan-400/10 group-hover:bg-cyan-400 text-cyan-400 group-hover:text-slate-950 transition-colors shrink-0">
                <Play className="w-3.5 h-3.5 fill-current" />
              </span>
            </div>

            {/* Current Show Details */}
            <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-200 truncate pr-2">
                  {channel.currentShow.title}
                </span>
                <span className="text-[10px] text-cyan-400 font-mono shrink-0 font-bold">
                  {channel.currentShow.startTime}
                </span>
              </div>

              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${channel.currentShow.progressPercent}%` }}
                />
              </div>

              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 pt-0.5">
                <Clock className="w-3 h-3 text-slate-500 shrink-0" />
                <span className="truncate">
                  A seguir: {channel.nextShow.title} ({channel.nextShow.startTime})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

