export type MediaType = 'movie' | 'series' | 'dorama' | 'channel';

export interface StreamSource {
  name: string;
  url: string;
  type: 'hls' | 'mp4' | 'embed';
}

export interface Episode {
  id: string;
  episodeNumber: number;
  title: string;
  overview?: string;
  duration?: string;
  thumbnail?: string;
  sources: StreamSource[];
}

export interface Season {
  seasonNumber: number;
  title: string;
  episodes: Episode[];
}

export interface MediaItem {
  id: string;
  title: string;
  originalTitle?: string;
  type: 'movie' | 'series' | 'dorama';
  posterUrl: string;
  backdropUrl: string;
  overview: string;
  releaseYear: number;
  rating: number; // e.g. 8.7
  genres: string[];
  duration?: string; // for movies
  country?: string; // e.g. "Coreia do Sul", "China", "Japão", "EUA"
  audio?: ('Dublado' | 'Legendado')[];
  featured?: boolean;
  seasons?: Season[]; // for series & doramas
  sources?: StreamSource[]; // for movies
  tags?: string[];
}

export interface Channel {
  id: string;
  name: string;
  slug: string;
  category: 'TV Aberta' | 'Esportes' | 'Filmes e Séries' | 'Notícias' | 'Infantil' | 'Documentários' | 'Variedades';
  logoUrl: string;
  currentShow: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    progressPercent: number;
  };
  nextShow: {
    title: string;
    startTime: string;
  };
  sources: StreamSource[];
}

export interface Match {
  id: string;
  championship: string;
  championshipLogo?: string;
  team1: {
    name: string;
    badge: string;
  };
  team2: {
    name: string;
    badge: string;
  };
  time: string;
  status: 'Ao Vivo' | 'Hoje' | 'Encerrado';
  channelSlug: string;
  channelName: string;
}

export interface WatchProgress {
  mediaId: string;
  title: string;
  posterUrl: string;
  type: MediaType;
  seasonNumber?: number;
  episodeNumber?: number;
  progressPercent: number;
  timestamp: number;
}
