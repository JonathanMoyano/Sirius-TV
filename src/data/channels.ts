import { Channel } from '../types';

export const channelsData: Channel[] = [
  // TV Aberta
  {
    id: 'globo',
    name: 'TV Globo',
    slug: 'globo',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Rede_Globo_logo.svg/300px-Rede_Globo_logo.svg.png',
    currentShow: {
      title: 'Jornal Hoje / Novela das Seis',
      description: 'As principais notícias do dia no Brasil e no mundo com reportagens especiais.',
      startTime: '13:25',
      endTime: '14:45',
      progressPercent: 55,
    },
    nextShow: {
      title: 'Sessão da Tarde',
      startTime: '14:45',
    },
    sources: [
      {
        name: 'Servidor Principal (HLS)',
        url: 'https://cdn.jmvstream.com/live/10936/10936_7781b0a887b46d795b54636da6670868a8349fa8a2a893693e50df44dbbcdd2c/playlist.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2 (Alternativo)',
        url: 'https://saimo-tv.pages.dev/api/stream?tipo=channel&id=globo',
        type: 'embed',
      },
      {
        name: 'Player Web',
        url: 'https://embedflix.net/tv/globo',
        type: 'embed',
      },
    ],
  },
  {
    id: 'sbt',
    name: 'SBT HD',
    slug: 'sbt',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/22/Logo_do_SBT.svg/300px-Logo_do_SBT.svg.png',
    currentShow: {
      title: 'Primeiro Impacto / Programação da Tarde',
      description: 'Jornalismo factual com agilidade e os principais fatos da manhã e tarde.',
      startTime: '13:00',
      endTime: '15:30',
      progressPercent: 40,
    },
    nextShow: {
      title: 'Fofocalizando',
      startTime: '15:30',
    },
    sources: [
      {
        name: 'Servidor Oficial (HLS)',
        url: 'https://aovivo.sbt.com.br/hls/live.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/sbt',
        type: 'embed',
      },
    ],
  },
  {
    id: 'record',
    name: 'Record TV',
    slug: 'record',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/pt/thumb/d/d4/Logotipo_da_Record.png/300px-Logotipo_da_Record.png',
    currentShow: {
      title: 'Balanço Geral',
      description: 'Notícias do dia, prestação de serviço, comunidade e o quadro A Hora da Venenosa.',
      startTime: '11:50',
      endTime: '15:30',
      progressPercent: 65,
    },
    nextShow: {
      title: 'Novela da Tarde',
      startTime: '15:30',
    },
    sources: [
      {
        name: 'Servidor Principal (HLS)',
        url: 'https://stream.recordtv.com.br/live/record_hd/playlist.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/record',
        type: 'embed',
      },
    ],
  },
  {
    id: 'band',
    name: 'Band TV',
    slug: 'band',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Band_logo_2018.svg/300px-Band_logo_2018.svg.png',
    currentShow: {
      title: 'Os Donos da Bola',
      description: 'Craque Neto e comentaristas debatem os jogos da rodada com humor e polêmica.',
      startTime: '13:00',
      endTime: '14:30',
      progressPercent: 70,
    },
    nextShow: {
      title: 'Melhor da Tarde',
      startTime: '14:30',
    },
    sources: [
      {
        name: 'Servidor Oficial (HLS)',
        url: 'https://evpp.mm.uol.com.br/geoband/band/playlist.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/band',
        type: 'embed',
      },
    ],
  },
  {
    id: 'cultura',
    name: 'TV Cultura',
    slug: 'cultura',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/TV_Cultura_logo.svg/300px-TV_Cultura_logo.svg.png',
    currentShow: {
      title: 'Jornal da Cultura / Roda Viva Especial',
      description: 'Debates profundos e programação educativa de alta qualidade.',
      startTime: '13:00',
      endTime: '14:00',
      progressPercent: 80,
    },
    nextShow: {
      title: 'Quintal da Cultura',
      startTime: '14:00',
    },
    sources: [
      {
        name: 'Servidor Principal (HLS)',
        url: 'https://cdn.jmvstream.com/live/cultura/playlist.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/tvcultura',
        type: 'embed',
      },
    ],
  },
  {
    id: 'redetv',
    name: 'RedeTV!',
    slug: 'redetv',
    category: 'TV Aberta',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/RedeTV%21_logo.svg/300px-RedeTV%21_logo.svg.png',
    currentShow: {
      title: 'A Tarde é Sua',
      description: 'Sônia Abrão e sua equipe comentam as principais novidades dos famosos e bastidores da TV.',
      startTime: '15:00',
      endTime: '17:00',
      progressPercent: 20,
    },
    nextShow: {
      title: 'RedeTV! News',
      startTime: '19:30',
    },
    sources: [
      {
        name: 'Servidor Principal (HLS)',
        url: 'https://redetv.com.br/live/stream.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/redetv',
        type: 'embed',
      },
    ],
  },
  // Esportes
  {
    id: 'sportv',
    name: 'SporTV HD',
    slug: 'sportv',
    category: 'Esportes',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/SporTV_logo_2021.svg/300px-SporTV_logo_2021.svg.png',
    currentShow: {
      title: 'Seleção SporTV',
      description: 'André Rizek e os melhores analistas do país discutem o futebol brasileiro e mundial.',
      startTime: '13:00',
      endTime: '15:00',
      progressPercent: 50,
    },
    nextShow: {
      title: 'Futebol Ao Vivo - Pré-Jogo',
      startTime: '15:00',
    },
    sources: [
      {
        name: 'Servidor 1 (HD)',
        url: 'https://embedflix.net/tv/sportv',
        type: 'embed',
      },
      {
        name: 'Servidor 2 (Alternativo)',
        url: 'https://saimo-tv.pages.dev/api/stream?tipo=channel&id=sportv',
        type: 'embed',
      },
    ],
  },
  {
    id: 'espn',
    name: 'ESPN Brasil',
    slug: 'espn',
    category: 'Esportes',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/ESPN_wordmark.svg/300px-ESPN_wordmark.svg.png',
    currentShow: {
      title: 'ESPN F90',
      description: 'Debates dinâmicos com análise tática e notícias exclusivas dos clubes.',
      startTime: '15:30',
      endTime: '18:00',
      progressPercent: 15,
    },
    nextShow: {
      title: 'SportsCenter',
      startTime: '18:00',
    },
    sources: [
      {
        name: 'Servidor 1',
        url: 'https://embedflix.net/tv/espn',
        type: 'embed',
      },
      {
        name: 'Servidor 2',
        url: 'https://saimo-tv.pages.dev/api/stream?tipo=channel&id=espn',
        type: 'embed',
      },
    ],
  },
  {
    id: 'cazetv',
    name: 'CazéTV',
    slug: 'cazetv',
    category: 'Esportes',
    logoUrl: 'https://yt3.googleusercontent.com/yS4u5-k35pms_u-pT-qYl83jDqYQjH3vU_Ea6hQ=s300-c-k-c0x00ffffff-no-rj',
    currentShow: {
      title: 'Transmissão Ao Vivo & Resenha',
      description: 'Casimiro e convidados transmitem os melhores campeonatos esportivos do mundo.',
      startTime: '14:00',
      endTime: '18:00',
      progressPercent: 35,
    },
    nextShow: {
      title: 'Pós-Jogo da Rodada',
      startTime: '18:00',
    },
    sources: [
      {
        name: 'YouTube Live Stream',
        url: 'https://www.youtube.com/embed/live_stream?channel=UC4P2n_2iJv4HkG1e4r2e1aA',
        type: 'embed',
      },
      {
        name: 'Servidor Alternativo',
        url: 'https://embedflix.net/tv/cazetv',
        type: 'embed',
      },
    ],
  },
  {
    id: 'premiere',
    name: 'Premiere Clubes',
    slug: 'premiere',
    category: 'Esportes',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Premiere_logo_2021.svg/300px-Premiere_logo_2021.svg.png',
    currentShow: {
      title: 'Gols da Rodada & Pré-Jogo',
      description: 'O melhor do Campeonato Brasileiro com todos os jogos exclusivos.',
      startTime: '14:00',
      endTime: '16:00',
      progressPercent: 60,
    },
    nextShow: {
      title: 'Futebol Ao Vivo - Brasileirão',
      startTime: '16:00',
    },
    sources: [
      {
        name: 'Servidor 1',
        url: 'https://embedflix.net/tv/premiere',
        type: 'embed',
      },
    ],
  },
  // Filmes e Séries
  {
    id: 'hbo',
    name: 'HBO Signature',
    slug: 'hbo',
    category: 'Filmes e Séries',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/de/HBO_logo.svg/300px-HBO_logo.svg.png',
    currentShow: {
      title: 'Duna: Parte 2',
      description: 'Paul Atreides se une a Chani e aos Fremen em busca de vingança contra os conspiradores.',
      startTime: '13:45',
      endTime: '16:30',
      progressPercent: 45,
    },
    nextShow: {
      title: 'The Last of Us',
      startTime: '16:30',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/hbo',
        type: 'embed',
      },
    ],
  },
  {
    id: 'warner-channel',
    name: 'Warner Channel',
    slug: 'warner-channel',
    category: 'Filmes e Séries',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Warner_Channel_logo_2018.svg/300px-Warner_Channel_logo_2018.svg.png',
    currentShow: {
      title: 'The Big Bang Theory / Friends',
      description: 'Maratona com os episódios mais divertidos das comédias mais amadas da televisão.',
      startTime: '14:00',
      endTime: '16:00',
      progressPercent: 50,
    },
    nextShow: {
      title: 'Harry Potter e o Cálice de Fogo',
      startTime: '16:00',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/warner',
        type: 'embed',
      },
    ],
  },
  {
    id: 'telecine-action',
    name: 'Telecine Action',
    slug: 'telecine-action',
    category: 'Filmes e Séries',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Telecine_Action_logo_2021.svg/300px-Telecine_Action_logo_2021.svg.png',
    currentShow: {
      title: 'John Wick 4: Baba Yaga',
      description: 'Com o preço por sua cabeça sempre aumentando, Wick leva sua luta contra a Alta Cúpula global.',
      startTime: '14:15',
      endTime: '17:05',
      progressPercent: 30,
    },
    nextShow: {
      title: 'Missão: Impossível - Acerto de Contas',
      startTime: '17:05',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/telecine-action',
        type: 'embed',
      },
    ],
  },
  // Notícias
  {
    id: 'globonews',
    name: 'GloboNews',
    slug: 'globonews',
    category: 'Notícias',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/GloboNews_logo_2021.svg/300px-GloboNews_logo_2021.svg.png',
    currentShow: {
      title: 'Estúdio i',
      description: 'Aline Midlej e analistas políticos debatem os bastidores de Brasília e do mundo.',
      startTime: '13:00',
      endTime: '16:00',
      progressPercent: 60,
    },
    nextShow: {
      title: 'GloboNews Mais',
      startTime: '16:00',
    },
    sources: [
      {
        name: 'Servidor 1',
        url: 'https://embedflix.net/tv/globonews',
        type: 'embed',
      },
    ],
  },
  {
    id: 'cnn-brasil',
    name: 'CNN Brasil',
    slug: 'cnn-brasil',
    category: 'Notícias',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/68/CNN_Brasil_logo.svg/300px-CNN_Brasil_logo.svg.png',
    currentShow: {
      title: 'CNN 360°',
      description: 'A cobertura mais completa dos acontecimentos que impactam a política e a economia.',
      startTime: '15:00',
      endTime: '18:00',
      progressPercent: 25,
    },
    nextShow: {
      title: 'CNN Arena',
      startTime: '18:00',
    },
    sources: [
      {
        name: 'Servidor Principal (HLS)',
        url: 'https://cdn.jmvstream.com/live/cnnbrasil/playlist.m3u8',
        type: 'hls',
      },
      {
        name: 'Servidor 2',
        url: 'https://embedflix.net/tv/cnn-brasil',
        type: 'embed',
      },
    ],
  },
  {
    id: 'jovem-pan-news',
    name: 'Jovem Pan News',
    slug: 'jovem-pan-news',
    category: 'Notícias',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/Jovem_Pan_News_logo_2021.svg/300px-Jovem_Pan_News_logo_2021.svg.png',
    currentShow: {
      title: 'Pânico / Os Pingos nos Is',
      description: 'Debates quentes sobre os temas que agitam a sociedade brasileira.',
      startTime: '12:00',
      endTime: '14:30',
      progressPercent: 85,
    },
    nextShow: {
      title: 'Linha de Frente',
      startTime: '14:30',
    },
    sources: [
      {
        name: 'Servidor 1',
        url: 'https://embedflix.net/tv/jovem-pan-news',
        type: 'embed',
      },
    ],
  },
  // Infantil
  {
    id: 'cartoon-network',
    name: 'Cartoon Network',
    slug: 'cartoon-network',
    category: 'Infantil',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/Cartoon_Network_2010_logo.svg/300px-Cartoon_Network_2010_logo.svg.png',
    currentShow: {
      title: 'O Incrível Mundo de Gumball',
      description: 'As aventuras hilárias do gato azul Gumball e seu irmão adotivo peixinho dourado Darwin.',
      startTime: '14:00',
      endTime: '15:00',
      progressPercent: 40,
    },
    nextShow: {
      title: 'Jovens Titãs em Ação!',
      startTime: '15:00',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/cartoon-network',
        type: 'embed',
      },
    ],
  },
  {
    id: 'discovery-kids',
    name: 'Discovery Kids',
    slug: 'discovery-kids',
    category: 'Infantil',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Discovery_Kids_logo_2016.svg/300px-Discovery_Kids_logo_2016.svg.png',
    currentShow: {
      title: 'Peppa Pig / O Show da Luna',
      description: 'Desenhos educativos e alegres para as crianças aprenderem brincando.',
      startTime: '14:15',
      endTime: '15:15',
      progressPercent: 30,
    },
    nextShow: {
      title: 'Patrulha Canina',
      startTime: '15:15',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/discovery-kids',
        type: 'embed',
      },
    ],
  },
  // Documentários
  {
    id: 'discovery-channel',
    name: 'Discovery Channel',
    slug: 'discovery-channel',
    category: 'Documentários',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Discovery_Channel_logo_2019.svg/300px-Discovery_Channel_logo_2019.svg.png',
    currentShow: {
      title: 'Largados e Pelados (Naked and Afraid)',
      description: 'Sobrevivencialistas enfrentam os ambientes mais hostis do planeta sem roupas nem comida.',
      startTime: '14:00',
      endTime: '15:45',
      progressPercent: 50,
    },
    nextShow: {
      title: 'Febre do Ouro',
      startTime: '15:45',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/discovery',
        type: 'embed',
      },
    ],
  },
  {
    id: 'history-channel',
    name: 'History Channel',
    slug: 'history-channel',
    category: 'Documentários',
    logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/History_Logo.svg/300px-History_Logo.svg.png',
    currentShow: {
      title: 'Trato Feito (Pawn Stars)',
      description: 'A família Harrison avalia e negocia antiguidades e peças históricas raras em Las Vegas.',
      startTime: '14:30',
      endTime: '15:30',
      progressPercent: 25,
    },
    nextShow: {
      title: 'Alienígenas do Passado',
      startTime: '15:30',
    },
    sources: [
      {
        name: 'Servidor HD',
        url: 'https://embedflix.net/tv/history',
        type: 'embed',
      },
    ],
  },
];
