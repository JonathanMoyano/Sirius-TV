import { Match } from '../types';

export const matchesData: Match[] = [
  {
    id: 'match-1',
    championship: 'Brasileirão Série A',
    team1: {
      name: 'Flamengo',
      badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Flamengo_braz_logo.svg/200px-Flamengo_braz_logo.svg.png',
    },
    team2: {
      name: 'Palmeiras',
      badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/10/Palmeiras_logo.svg/200px-Palmeiras_logo.svg.png',
    },
    time: '16:00',
    status: 'Ao Vivo',
    channelSlug: 'globo',
    channelName: 'TV Globo & Premiere',
  },
  {
    id: 'match-2',
    championship: 'UEFA Champions League',
    team1: {
      name: 'Real Madrid',
      badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/200px-Real_Madrid_CF.svg.png',
    },
    team2: {
      name: 'Manchester City',
      badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/200px-Manchester_City_FC_badge.svg.png',
    },
    time: '17:00',
    status: 'Hoje',
    channelSlug: 'cazetv',
    channelName: 'CazéTV & TNT Sports',
  },
  {
    id: 'match-3',
    championship: 'Copa Libertadores',
    team1: {
      name: 'São Paulo',
      badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Brasao_do_Sao_Paulo_Futebol_Clube.svg/200px-Brasao_do_Sao_Paulo_Futebol_Clube.svg.png',
    },
    team2: {
      name: 'River Plate',
      badge: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/Escudo_del_C_A_River_Plate.svg/200px-Escudo_del_C_A_River_Plate.svg.png',
    },
    time: '21:30',
    status: 'Hoje',
    channelSlug: 'espn',
    channelName: 'ESPN & Star+',
  },
  {
    id: 'match-4',
    championship: 'Premier League',
    team1: {
      name: 'Arsenal',
      badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/200px-Arsenal_FC.svg.png',
    },
    team2: {
      name: 'Liverpool',
      badge: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/200px-Liverpool_FC.svg.png',
    },
    time: '13:30',
    status: 'Encerrado',
    channelSlug: 'espn',
    channelName: 'ESPN',
  },
];
