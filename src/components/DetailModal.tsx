import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Play, Star, Plus, Check, X, Sparkles, Globe, Clock, Clapperboard } from 'lucide-react';

export const DetailModal: React.FC = () => {
  const { detailItem, closeDetail, openPlayer, toggleFavorite, isFavorite, allMedia } = useApp();
  const [selectedSeasonIndex, setSelectedSeasonIndex] = useState(0);

  if (!detailItem) return null;

  const favorited = isFavorite(detailItem.id);
  const isSeriesOrDorama = !!(detailItem.seasons && detailItem.seasons.length > 0);
  const currentSeason = isSeriesOrDorama ? detailItem.seasons![selectedSeasonIndex] : null;

  const handlePlayFirst = () => {
    if (isSeriesOrDorama && currentSeason && currentSeason.episodes.length > 0) {
      openPlayer(detailItem, currentSeason.episodes[0], currentSeason.seasonNumber);
    } else {
      openPlayer(detailItem);
    }
  };

  // Recommendations: same genre or type
  const similarItems = allMedia
    .filter((m) => m.id !== detailItem.id && (m.type === detailItem.type || m.genres.some((g) => detailItem.genres.includes(g))))
    .slice(0, 4);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 lg:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#090c1a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={closeDetail}
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-md transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Container */}
        <div className="overflow-y-auto flex-1">
          {/* Backdrop Header */}
          <div className="relative w-full aspect-[21/9] min-h-[220px] max-h-[360px] bg-slate-900">
            <img
              src={detailItem.backdropUrl || detailItem.posterUrl}
              alt={detailItem.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#090c1a] via-[#090c1a]/60 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090c1a] via-[#090c1a]/50 to-transparent" />

            {/* Poster thumbnail & Quick Header */}
            <div className="absolute bottom-4 left-4 sm:left-6 flex items-end gap-4">
              <img
                src={detailItem.posterUrl}
                alt={detailItem.title}
                className="w-24 sm:w-32 aspect-[2/3] object-cover rounded-xl border-2 border-slate-700 shadow-2xl hidden xs:block"
              />
              <div className="space-y-1.5 max-w-lg">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{detailItem.rating.toFixed(1)}</span>
                  </div>
                  <span className="text-xs text-slate-300 font-medium">
                    {detailItem.releaseYear}
                  </span>
                  {detailItem.country && (
                    <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded border border-purple-500/30 font-semibold">
                      {detailItem.country}
                    </span>
                  )}
                  {detailItem.audio && (
                    <span className="text-xs text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/30">
                      {detailItem.audio.join(' / ')}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white">
                  {detailItem.title}
                </h2>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {/* Actions Bar */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePlayFirst}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-slate-950 font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all"
              >
                <Play className="w-5 h-5 fill-slate-950" />
                <span>
                  {isSeriesOrDorama ? 'Começar a Assistir' : 'Assistir Filme'}
                </span>
              </button>

              <button
                onClick={() => toggleFavorite(detailItem.id)}
                className={`px-4 py-3 rounded-xl border text-sm font-semibold flex items-center gap-2 transition-all ${
                  favorited
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : 'bg-slate-900 border-slate-700 text-slate-200 hover:bg-slate-800'
                }`}
              >
                {favorited ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                <span>{favorited ? 'Salvo na Minha Lista' : 'Adicionar à Lista'}</span>
              </button>
            </div>

            {/* Synopsis & Tags */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Sinopse</h3>
              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                {detailItem.overview}
              </p>

              <div className="flex flex-wrap gap-2 pt-2">
                {detailItem.genres.map((g) => (
                  <span
                    key={g}
                    className="text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1 rounded-full font-medium"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Series / Dorama Episode Grid */}
            {isSeriesOrDorama && currentSeason && (
              <div className="pt-4 border-t border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clapperboard className="w-5 h-5 text-cyan-400" />
                    <h3 className="font-bold text-lg text-white">Episódios</h3>
                  </div>

                  {/* Season selector if multiple */}
                  {detailItem.seasons!.length > 1 && (
                    <select
                      value={selectedSeasonIndex}
                      onChange={(e) => setSelectedSeasonIndex(Number(e.target.value))}
                      className="bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                    >
                      {detailItem.seasons!.map((s, idx) => (
                        <option key={s.seasonNumber} value={idx}>
                          {s.title}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSeason.episodes.map((ep) => (
                    <div
                      key={ep.id}
                      onClick={() => openPlayer(detailItem, ep, currentSeason.seasonNumber)}
                      className="group p-3.5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all flex flex-col justify-between gap-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-cyan-400">
                            Episódio {ep.episodeNumber}
                          </span>
                          <h4 className="font-semibold text-sm text-white group-hover:text-cyan-300 transition-colors truncate">
                            {ep.title}
                          </h4>
                        </div>
                        <span className="p-2 rounded-full bg-cyan-400/10 group-hover:bg-cyan-400 text-cyan-400 group-hover:text-slate-950 transition-colors shrink-0">
                          <Play className="w-3.5 h-3.5 fill-current" />
                        </span>
                      </div>

                      {ep.overview && (
                        <p className="text-xs text-slate-400 line-clamp-2">
                          {ep.overview}
                        </p>
                      )}

                      {ep.duration && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                          <Clock className="w-3 h-3" />
                          <span>{ep.duration}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Similar titles */}
            {similarItems.length > 0 && (
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                  Títulos Relacionados
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {similarItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => openPlayer(item)}
                      className="group rounded-xl overflow-hidden bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-all"
                    >
                      <div className="aspect-[2/3] w-full bg-slate-800 overflow-hidden">
                        <img
                          src={item.posterUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <div className="p-2">
                        <span className="text-xs font-semibold text-white truncate block group-hover:text-cyan-400">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-slate-400">{item.releaseYear}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
