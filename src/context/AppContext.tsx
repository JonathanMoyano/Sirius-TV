import React, { createContext, useContext, useState, useEffect } from 'react';
import { Channel, MediaItem, Episode } from '../types';
import { moviesData } from '../data/movies';
import { seriesData } from '../data/series';
import { doramasData } from '../data/doramas';
import { channelsData } from '../data/channels';

export type NavTab = 'home' | 'channels' | 'movies' | 'series' | 'doramas' | 'matches' | 'favorites';

export interface ActivePlayerState {
  isOpen: boolean;
  item: MediaItem | Channel | null;
  episode?: Episode;
  seasonNumber?: number;
  serverIndex: number;
}

interface AppContextType {
  currentTab: NavTab;
  setCurrentTab: (tab: NavTab) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  favorites: string[]; // IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  playerState: ActivePlayerState;
  openPlayer: (item: MediaItem | Channel, episode?: Episode, seasonNumber?: number) => void;
  closePlayer: () => void;
  switchServer: (index: number) => void;
  detailItem: MediaItem | null;
  openDetail: (item: MediaItem) => void;
  closeDetail: () => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  allMedia: MediaItem[];
  allChannels: Channel[];
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Favorites persisted in localStorage
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sirius_tv_favorites');
      return saved ? JSON.parse(saved) : ['rainha-das-lagrimas', 'globo', 'duna-parte-2', 'the-last-of-us'];
    } catch {
      return ['rainha-das-lagrimas', 'globo', 'duna-parte-2', 'the-last-of-us'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sirius_tv_favorites', JSON.stringify(favorites));
    } catch {
      // ignore
    }
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const isFavorite = (id: string) => favorites.includes(id);

  // Player state
  const [playerState, setPlayerState] = useState<ActivePlayerState>({
    isOpen: false,
    item: null,
    serverIndex: 0,
  });

  const openPlayer = (item: MediaItem | Channel, episode?: Episode, seasonNumber?: number) => {
    setPlayerState({
      isOpen: true,
      item,
      episode,
      seasonNumber,
      serverIndex: 0,
    });
  };

  const closePlayer = () => {
    setPlayerState((prev) => ({ ...prev, isOpen: false }));
  };

  const switchServer = (index: number) => {
    setPlayerState((prev) => ({ ...prev, serverIndex: index }));
  };

  // Detail Modal state
  const [detailItem, setDetailItem] = useState<MediaItem | null>(null);

  const openDetail = (item: MediaItem) => {
    setDetailItem(item);
  };

  const closeDetail = () => {
    setDetailItem(null);
  };

  // Combined data
  const allMedia = [...doramasData, ...moviesData, ...seriesData];
  const [allChannels, setAllChannels] = useState<Channel[]>(channelsData);

  useEffect(() => {
    fetch('/data/catalogo.json')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const mapped: Channel[] = data.map((c: any) => {
            // Check if there is an existing enriched channel in channelsData
            const existing = channelsData.find((ch) => ch.id === c.id || ch.name.toLowerCase() === c.name.toLowerCase());
            return {
              id: c.id,
              name: c.name,
              slug: c.id,
              category: c.category || 'Variedades',
              logoUrl: c.logo || existing?.logoUrl || 'https://via.placeholder.com/100x100?text=' + encodeURIComponent(c.name),
              currentShow: existing?.currentShow || {
                title: 'Transmissão Ao Vivo HD',
                description: 'Assista a programação em tempo real no Sirius TV',
                startTime: '13:00',
                endTime: '15:00',
                progressPercent: 45,
              },
              nextShow: existing?.nextShow || {
                title: 'Programação a Seguir',
                startTime: '15:00',
              },
              sources: (c.sources && c.sources.length > 0)
                ? c.sources.map((src: string, idx: number) => ({
                    name: `Servidor ${idx + 1}`,
                    url: src,
                    type: 'hls' as const,
                  }))
                : existing?.sources || [],
            };
          });
          setAllChannels(mapped);
        }
      })
      .catch((err) => {
        console.warn('Carregamento de canais:', err);
      });
  }, []);

  // Shortcut for search Ctrl+K or /
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName))) {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        closePlayer();
        closeDetail();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <AppContext.Provider
      value={{
        currentTab,
        setCurrentTab,
        selectedCategory,
        setSelectedCategory,
        favorites,
        toggleFavorite,
        isFavorite,
        playerState,
        openPlayer,
        closePlayer,
        switchServer,
        detailItem,
        openDetail,
        closeDetail,
        isSearchOpen,
        setIsSearchOpen,
        searchQuery,
        setSearchQuery,
        allMedia,
        allChannels,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

