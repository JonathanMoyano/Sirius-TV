import React, { useState } from 'react';
import { useApp, NavTab } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MediaCard } from './components/MediaCard';
import { ChannelCard } from './components/ChannelCard';
import { VideoPlayerModal } from './components/VideoPlayerModal';
import { DetailModal } from './components/DetailModal';
import { SearchModal } from './components/SearchModal';
import { EPGGuide } from './components/EPGGuide';
import { Footer } from './components/Footer';
import { LiveChannelsPage } from './components/LiveChannelsPage';
import { moviesData } from './data/movies';
import { seriesData } from './data/series';
import { doramasData } from './data/doramas';
import {
  Radio,
  Film,
  Sparkles,
  Clapperboard,
  Heart,
  ChevronRight,
} from 'lucide-react';
import { useDpadNavigation } from './hooks/useDpadNavigation';

export const AppContent: React.FC = () => {
  useDpadNavigation();
  const { currentTab, setCurrentTab, favorites, allMedia, allChannels } = useApp();

  // Local filter states for individual tabs
  const [selectedMovieGenre, setSelectedMovieGenre] = useState<string>('Todos');
  const [selectedSeriesGenre, setSelectedSeriesGenre] = useState<string>('Todos');
  const [selectedDoramaCountry, setSelectedDoramaCountry] = useState<string>('Todos');
  const [selectedDoramaAudio, setSelectedDoramaAudio] = useState<string>('Todos');

  // Featured hero items
  const featuredItems = [
    doramasData[0], // Rainha das Lágrimas
    moviesData[0],  // Duna 2
    seriesData[0],  // The Last of Us
    moviesData[1],  // Deadpool & Wolverine
    doramasData[1], // Pousando no Amor
  ];

  // Favorite items
  const favoriteMedia = allMedia.filter((m) => favorites.includes(m.id));
  const favoriteChannels = allChannels.filter((c) => favorites.includes(c.id));

  return (
    <div className="min-h-screen bg-[#070913] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Navbar */}
      <Navbar />

      {/* Main Body */}
      <main className="flex-1">
        {/* =========================================
            TAB 1: INÍCIO (HOME)
        ========================================= */}
        {currentTab === 'home' && (
          <div className="space-y-12">
            {/* Cinematic Hero */}
            <HeroBanner items={featuredItems} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
              {/* Quick Navigation Cards: Only TV Ao Vivo, Doramas, Filmes, Séries */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 -mt-6 sm:-mt-10 relative z-20">
                {[
                  {
                    id: 'channels' as NavTab,
                    title: 'TV Ao Vivo',
                    subtitle: 'Canais Abertos e Fechados',
                    icon: <Radio className="w-5 h-5 text-rose-500 animate-pulse" />,
                    gradient: 'from-rose-500/10 to-orange-500/10 border-rose-500/30',
                  },
                  {
                    id: 'doramas' as NavTab,
                    title: 'Doramas',
                    subtitle: 'K-Dramas & C-Dramas',
                    icon: <Sparkles className="w-5 h-5 text-amber-400" />,
                    gradient: 'from-purple-500/10 to-pink-500/10 border-purple-500/30',
                  },
                  {
                    id: 'filmes' as any,
                    title: 'Filmes',
                    subtitle: 'Lançamentos & Clássicos',
                    icon: <Film className="w-5 h-5 text-cyan-400" />,
                    gradient: 'from-cyan-500/10 to-blue-500/10 border-cyan-500/30',
                  },
                  {
                    id: 'series' as NavTab,
                    title: 'Séries',
                    subtitle: 'Temporadas Completas',
                    icon: <Clapperboard className="w-5 h-5 text-indigo-400" />,
                    gradient: 'from-indigo-500/10 to-blue-500/10 border-indigo-500/30',
                  },
                ].map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setCurrentTab(cat.id)}
                    className={`group p-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800/90 border ${cat.gradient} cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-xl backdrop-blur-md flex items-center justify-between`}
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        {cat.icon}
                        <h3 className="font-bold text-sm sm:text-base text-white group-hover:text-cyan-300 transition-colors">
                          {cat.title}
                        </h3>
                      </div>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{cat.subtitle}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                  </div>
                ))}
              </div>

              {/* SECTION: CANAIS AO VIVO EM DESTAQUE */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      <Radio className="w-5 h-5 animate-pulse" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Canais de TV Ao Vivo
                      </h2>
                      <p className="text-xs text-slate-400">
                        Assista aos principais canais abertos e fechados em tempo real
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('channels')}
                    className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                  >
                    <span>Ver todos ({allChannels.length})</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {allChannels.slice(0, 8).map((channel) => (
                    <ChannelCard key={channel.id} channel={channel} />
                  ))}
                </div>
              </section>

              {/* SECTION: DORAMAS (K-DRAMAS & C-DRAMAS) */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
                      <Sparkles className="w-5 h-5" />
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl sm:text-2xl font-black text-white">
                          Doramas em Alta
                        </h2>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold uppercase">
                          K-Drama & C-Drama
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Os doramas coreanos, chineses e japoneses mais amados do mundo
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('doramas')}
                    className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                  >
                    <span>Ver todos</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {doramasData.map((dorama) => (
                    <MediaCard key={dorama.id} item={dorama} />
                  ))}
                </div>
              </section>

              {/* SECTION: FILMES POPULARES */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      <Film className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Filmes Populares
                      </h2>
                      <p className="text-xs text-slate-400">
                        Grandes sucessos do cinema em alta definição
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('filmes' as any)}
                    className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                  >
                    <span>Ver catálogo</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
                  {moviesData.map((movie) => (
                    <MediaCard key={movie.id} item={movie} />
                  ))}
                </div>
              </section>

              {/* SECTION: SÉRIES */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                      <Clapperboard className="w-5 h-5" />
                    </span>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        Séries para Maratonar
                      </h2>
                      <p className="text-xs text-slate-400">
                        Temporadas completas com dublagem e legendas
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setCurrentTab('series')}
                    className="text-xs sm:text-sm font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 group"
                  >
                    <span>Ver séries</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                  {seriesData.map((series) => (
                    <MediaCard key={series.id} item={series} />
                  ))}
                </div>
              </section>

              {/* SECTION: EPG GUIDE */}
              <EPGGuide />
            </div>
          </div>
        )}

        {/* =========================================
            TAB 2: CANAIS DE TV AO VIVO (Página Completa Estilo Saimo + Modo UniTV)
        ========================================= */}
        {currentTab === 'channels' && <LiveChannelsPage />}

        {/* =========================================
            TAB 3: FILMES
        ========================================= */}
        {((currentTab as any) === 'filmes' || currentTab === 'movies') && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Film className="w-6 h-6 text-cyan-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Filmes Online Grátis
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Assista a lançamentos do cinema e sucessos de bilheteria em alta definição.
                </p>
              </div>

              {/* Genre Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {['Todos', 'Ação', 'Ficção Científica', 'Aventura', 'Comédia', 'Drama', 'Animação'].map(
                  (genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedMovieGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        selectedMovieGenre === genre
                          ? 'bg-gradient-to-r from-cyan-400 to-blue-600 text-slate-950 shadow-md shadow-cyan-400/20'
                          : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Movies Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {moviesData
                .filter(
                  (m) =>
                    selectedMovieGenre === 'Todos' || m.genres.includes(selectedMovieGenre)
                )
                .map((movie) => (
                  <MediaCard key={movie.id} item={movie} />
                ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 4: SÉRIES
        ========================================= */}
        {currentTab === 'series' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Clapperboard className="w-6 h-6 text-indigo-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Séries Completas
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Todas as temporadas com seleção direta de episódios e múltiplos servidores.
                </p>
              </div>

              {/* Genre Filter */}
              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {['Todos', 'Drama', 'Ficção Científica', 'Fantasia', 'Suspense', 'Crime'].map(
                  (genre) => (
                    <button
                      key={genre}
                      onClick={() => setSelectedSeriesGenre(genre)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                        selectedSeriesGenre === genre
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                          : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      {genre}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Series Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {seriesData
                .filter(
                  (s) =>
                    selectedSeriesGenre === 'Todos' || s.genres.includes(selectedSeriesGenre)
                )
                .map((series) => (
                  <MediaCard key={series.id} item={series} />
                ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 5: DORAMAS (K-DRAMA, C-DRAMA, J-DRAMA)
        ========================================= */}
        {currentTab === 'doramas' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
              <div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-white">
                    Doramas Online Legendados e Dublados
                  </h1>
                </div>
                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                  Os melhores doramas coreanos (K-Drama), chineses (C-Drama) e japoneses (J-Drama) com todos os episódios.
                </p>
              </div>

              {/* Country & Audio Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {['Todos', 'Coreia do Sul', 'China', 'Japão'].map((country) => (
                  <button
                    key={country}
                    onClick={() => setSelectedDoramaCountry(country)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                      selectedDoramaCountry === country
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md shadow-purple-500/20'
                        : 'bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {country === 'Coreia do Sul'
                      ? '🇰🇷 Coreano (K-Drama)'
                      : country === 'China'
                      ? '🇨🇳 Chinês (C-Drama)'
                      : country === 'Japão'
                      ? '🇯🇵 Japonês (J-Drama)'
                      : 'Todos os Países'}
                  </button>
                ))}

                <span className="text-slate-600 hidden sm:inline">|</span>

                {['Todos', 'Dublado', 'Legendado'].map((aud) => (
                  <button
                    key={aud}
                    onClick={() => setSelectedDoramaAudio(aud)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                      selectedDoramaAudio === aud
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {aud === 'Todos' ? 'Todos os Áudios' : aud}
                  </button>
                ))}
              </div>
            </div>

            {/* Doramas Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {doramasData
                .filter(
                  (d) =>
                    (selectedDoramaCountry === 'Todos' || d.country === selectedDoramaCountry) &&
                    (selectedDoramaAudio === 'Todos' || (d.audio && d.audio.includes(selectedDoramaAudio as any)))
                )
                .map((dorama) => (
                  <MediaCard key={dorama.id} item={dorama} />
                ))}
            </div>
          </div>
        )}

        {/* =========================================
            TAB 6: MINHA LISTA (FAVORITOS)
        ========================================= */}
        {currentTab === 'favorites' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 space-y-10 animate-fadeIn">
            <div className="border-b border-slate-800 pb-6">
              <div className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                <h1 className="text-2xl sm:text-3xl font-black text-white">Minha Lista</h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Seus canais, filmes, séries e doramas favoritos salvos para acesso rápido.
              </p>
            </div>

            {favoriteChannels.length === 0 && favoriteMedia.length === 0 ? (
              <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                <Heart className="w-12 h-12 text-slate-700 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white">Sua lista está vazia</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Clique no ícone de estrela nos canais ou no botão de favoritos dos filmes e doramas para salvá-los aqui.
                </p>
              </div>
            ) : (
              <div className="space-y-12">
                {favoriteChannels.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Radio className="w-4 h-4 text-rose-500" />
                      <span>Canais Favoritos ({favoriteChannels.length})</span>
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {favoriteChannels.map((channel) => (
                        <ChannelCard key={channel.id} channel={channel} />
                      ))}
                    </div>
                  </div>
                )}

                {favoriteMedia.length > 0 && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <Film className="w-4 h-4 text-cyan-400" />
                      <span>Filmes, Séries & Doramas ({favoriteMedia.length})</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {favoriteMedia.map((item) => (
                        <MediaCard key={item.id} item={item} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Global Modals */}
      <VideoPlayerModal />
      <DetailModal />
      <SearchModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return <AppContent />;
}
