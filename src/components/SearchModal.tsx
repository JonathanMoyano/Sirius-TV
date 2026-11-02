import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Search, X, Film, Tv, Sparkles, Clapperboard, Star, Play } from 'lucide-react';

export const SearchModal: React.FC = () => {
  const { isSearchOpen, setIsSearchOpen, allMedia, allChannels, openDetail, openPlayer } = useApp();
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'movie' | 'series' | 'dorama' | 'channel'>('all');
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isSearchOpen]);

  if (!isSearchOpen) return null;

  // Filter media
  const lowerQuery = query.toLowerCase().trim();

  const filteredMedia = allMedia.filter((m) => {
    if (filterType !== 'all' && m.type !== filterType) return false;
    if (!lowerQuery) return true;
    return (
      m.title.toLowerCase().includes(lowerQuery) ||
      m.genres.some((g) => g.toLowerCase().includes(lowerQuery)) ||
      (m.country && m.country.toLowerCase().includes(lowerQuery))
    );
  });

  const filteredChannels = allChannels.filter((c) => {
    if (filterType !== 'all' && filterType !== 'channel') return false;
    if (!lowerQuery) return true;
    return (
      c.name.toLowerCase().includes(lowerQuery) ||
      c.category.toLowerCase().includes(lowerQuery) ||
      c.currentShow.title.toLowerCase().includes(lowerQuery)
    );
  });

  const totalResults = (filterType === 'channel' ? 0 : filteredMedia.length) + (['all', 'channel'].includes(filterType) ? filteredChannels.length : 0);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/85 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl bg-[#0a0d1d] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800/80 bg-slate-950/60">
          <Search className="w-5 h-5 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar filmes, séries, doramas ou canais..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm sm:text-base outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={() => setIsSearchOpen(false)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white text-xs"
          >
            ESC
          </button>
        </div>

        {/* Filter Type Pills */}
        <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-950/40 border-b border-slate-800/60 overflow-x-auto no-scrollbar">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'channel', label: 'Canais de TV', icon: <Tv className="w-3.5 h-3.5" /> },
            { id: 'movie', label: 'Filmes', icon: <Film className="w-3.5 h-3.5" /> },
            { id: 'series', label: 'Séries', icon: <Clapperboard className="w-3.5 h-3.5" /> },
            { id: 'dorama', label: 'Doramas', icon: <Sparkles className="w-3.5 h-3.5 text-amber-400" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilterType(item.id as any)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-all ${
                filterType === item.id
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Results List */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {totalResults === 0 ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Nenhum resultado encontrado para "{query}".
            </div>
          ) : (
            <>
              {/* Channels Section */}
              {['all', 'channel'].includes(filterType) && filteredChannels.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Canais de TV ({filteredChannels.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredChannels.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          openPlayer(c);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
                      >
                        <div className="w-10 h-10 rounded-lg bg-slate-800 p-1.5 flex items-center justify-center shrink-0">
                          <img
                            src={c.logoUrl}
                            alt={c.name}
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-white truncate block">
                            {c.name}
                          </span>
                          <span className="text-[11px] text-slate-400 truncate block">
                            {c.currentShow.title}
                          </span>
                        </div>
                        <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 text-[10px] font-black uppercase">
                          Ao Vivo
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Media Section */}
              {filterType !== 'channel' && filteredMedia.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Filmes, Séries & Doramas ({filteredMedia.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {filteredMedia.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          openDetail(m);
                          setIsSearchOpen(false);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 cursor-pointer transition-colors"
                      >
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-10 aspect-[2/3] object-cover rounded-md shrink-0 bg-slate-800"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="font-semibold text-xs text-white truncate block">
                            {m.title}
                          </span>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                            <span className="capitalize">{m.type === 'dorama' ? 'Dorama' : m.type === 'movie' ? 'Filme' : 'Série'}</span>
                            <span>•</span>
                            <span>{m.releaseYear}</span>
                            <span className="flex items-center text-amber-400 gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              {m.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
