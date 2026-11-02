import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Channel } from '../types';
import { ChannelCard } from './ChannelCard';
import { ChannelPlayerView } from './ChannelPlayerView';
import { UniTvLiveView } from './UniTvLiveView';
import { Radio, Search, Tv, Grid, ChevronRight, Star } from 'lucide-react';

export const LiveChannelsPage: React.FC = () => {
  const { allChannels, favorites } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<Channel | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'unitv'>('grid');

  // Categories with counts
  const categories = useMemo(() => {
    const map = new Map<string, number>();
    allChannels.forEach((c) => {
      const cat = c.category || 'Variedades';
      map.set(cat, (map.get(cat) || 0) + 1);
    });

    const list = [
      { name: 'Todos', count: allChannels.length },
      { name: 'Favoritos', count: allChannels.filter((c) => favorites.includes(c.id)).length },
      { name: 'TV Aberta', count: map.get('TV Aberta') || 0 },
      { name: 'Esportes', count: map.get('Esportes') || 0 },
      { name: 'Filmes e Séries', count: map.get('Filmes e Séries') || 0 },
      { name: 'Notícias', count: map.get('Notícias') || 0 },
      { name: 'Infantil', count: map.get('Infantil') || 0 },
      { name: 'Documentários', count: map.get('Documentários') || 0 },
      { name: 'Variedades', count: map.get('Variedades') || 0 },
      { name: 'Pluto TV', count: map.get('Pluto TV') || 0 },
      { name: '24 Horas', count: map.get('24 Horas') || 0 },
      { name: 'Músicas', count: map.get('Músicas') || 0 },
    ].filter((item) => item.count > 0 || item.name === 'Todos' || item.name === 'Favoritos');

    return list;
  }, [allChannels, favorites]);

  // Channels filtered by category and search
  const filteredChannels = useMemo(() => {
    return allChannels.filter((c) => {
      if (selectedCategory === 'Favoritos') {
        if (!favorites.includes(c.id)) return false;
      } else if (selectedCategory !== 'Todos' && c.category !== selectedCategory) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          c.name.toLowerCase().includes(q) ||
          c.currentShow.title.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allChannels, selectedCategory, searchQuery, favorites]);

  // Grouped by categories when "Todos" is selected and no search
  const categoriesToDisplay = useMemo(() => {
    if (selectedCategory !== 'Todos' || searchQuery.trim()) return [];
    const mainCats = [
      'TV Aberta',
      'Esportes',
      'Filmes e Séries',
      'Notícias',
      'Infantil',
      'Documentários',
      'Variedades',
      'Pluto TV',
      '24 Horas',
      'Músicas',
    ];
    return mainCats
      .map((cat) => ({
        category: cat,
        channels: allChannels.filter((c) => c.category === cat),
      }))
      .filter((g) => g.channels.length > 0);
  }, [allChannels, selectedCategory, searchQuery]);

  // If UniTV Mode is chosen
  if (viewMode === 'unitv') {
    return (
      <div className="relative">
        <div className="fixed top-18 right-6 z-50">
          <button
            onClick={() => setViewMode('grid')}
            className="px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-slate-700/80 shadow-2xl backdrop-blur-md flex items-center gap-2 text-xs font-bold transition-all"
          >
            <Grid className="w-4 h-4" />
            <span>Voltar ao Modo Grade</span>
          </button>
        </div>
        <UniTvLiveView />
      </div>
    );
  }

  // If a Channel is active in Player view (Screenshot 4)
  if (activeChannel) {
    return (
      <ChannelPlayerView
        channel={activeChannel}
        onSelectChannel={(newCh) => setActiveChannel(newCh)}
        onBackToGrid={() => setActiveChannel(null)}
        onOpenUniTvMode={() => setViewMode('unitv')}
      />
    );
  }

  // Standard Grid View matching Screenshot 3
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 animate-fadeIn">
      {/* Top Header matching Screenshot 3 */}
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Início</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold">TV Ao Vivo</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Sirius TV Ao Vivo: Canais de TV Online
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
              Sirius TV ao vivo reúne {allChannels.length} canais em 10 categorias — TV aberta, esportes, notícias, infantis e mais. Escolha o canal para ver o que está passando e assistir.
            </p>
          </div>

          {/* Mode Switcher: Grid vs UniTV */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setViewMode('unitv')}
              className="px-4 py-2 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-white text-xs font-bold transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20"
              title="Interface estilo UniTV ideal para Smart TV Box com controle remoto"
            >
              <Tv className="w-4 h-4" />
              <span>Modo TV Box (UniTV)</span>
            </button>
          </div>
        </div>

        {/* Category Pills matching Screenshot 3 */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-2 border-b border-slate-800/80">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => {
                setSelectedCategory(cat.name);
                setSearchQuery('');
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat.name
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-400/20 font-black'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {cat.name}
              {cat.count > 0 && selectedCategory !== cat.name && (
                <span className="ml-1.5 text-[10px] text-slate-400">({cat.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* When "Todos" is selected and no search: Render grouped sections matching Screenshot 3 */}
      {selectedCategory === 'Todos' && !searchQuery.trim() ? (
        <div className="space-y-12">
          {categoriesToDisplay.map((group) => (
            <section key={group.category} className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    {group.category}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Canais de {group.category.toLowerCase()} com o programa que está no ar agora.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedCategory(group.category)}
                  className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                >
                  <span>Ver {group.channels.length} canais</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* 16:9 Channel Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {group.channels.slice(0, 8).map((channel) => (
                  <div key={channel.id} onClick={() => setActiveChannel(channel)}>
                    <ChannelCard channel={channel} />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        /* Filtered Grid View for specific category or search */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              {selectedCategory === 'Todos' ? 'Todos os Canais' : selectedCategory} ({filteredChannels.length})
            </h2>
          </div>

          {filteredChannels.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 rounded-2xl border border-slate-800">
              <p className="text-sm text-slate-400">
                Nenhum canal encontrado nesta categoria.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredChannels.map((channel) => (
                <div key={channel.id} onClick={() => setActiveChannel(channel)}>
                  <ChannelCard channel={channel} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

