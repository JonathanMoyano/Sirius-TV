# 🌟 Sirius TV — O Universo do Entretenimento

Uma plataforma moderna de streaming inspirada no conceito do **Saimo TV**, porém elevada com identidade visual futurista (tema espacial Sirius com tons obsidian, ciano elétrico e roxo cósmico), experiência de usuário fluida e recursos completos para:

- 📺 **TV Ao Vivo & Guia de Programação (EPG):** Canais abertos (Globo, SBT, Record, Band, Cultura, RedeTV) e fechados (SporTV, ESPN, CazéTV, HBO, Warner, Telecine, GloboNews, CNN Brasil, Cartoon Network, Discovery Channel, etc.) com timeline interativa ("Passando Agora" com barra de progresso em tempo real e "A Seguir").
- 🍿 **Filmes Populares & Lançamentos:** Catálogo com sinopses, avaliações, gêneros (Ação, Ficção Científica, Comédia, Animação), múltiplos servidores de streaming e player responsivo.
- 🎬 **Séries:** Temporadas completas com seletor interativo de episódios (E01, E02...), reprodução contínua e botões de próximo episódio.
- 🌸 **Doramas (K-Drama, C-Drama, J-Drama):** Seção de destaque dedicada aos doramas mais amados da Coreia do Sul, China e Japão (*Rainha das Lágrimas*, *Pousando no Amor*, *Vincenzo*, *Pretendente Surpresa*, *Beleza Verdadeira*, *Amor Oculto*, *Alice in Borderland*), com filtros por país de origem e áudio (Dublado / Legendado).
- ⚽ **Jogos de Hoje (Futebol Ao Vivo):** Grade dos confrontos esportivos do dia (Brasileirão, Champions League, Libertadores, Premier League) com status em tempo real e atalho direto para o canal de transmissão.
- ⚡ **Player de Vídeo Avançado:**
  - Suporte nativo a **HLS (.m3u8)** via `hls.js` com auto-recuperação de erros e buffer adaptativo.
  - Suporte a múltiplos servidores de contingência (Servidor Principal, Servidor 2, Player Embed).
  - Gaveta rápida de episódios para maratonar séries e doramas sem sair da tela cheia.
  - Modo Tela Cheia (Fullscreen) e controles otimizados.
- 🔍 **Busca Global Instantânea (Ctrl + K):** Filtro em tempo real por título, gênero e categoria.
- ❤️ **Minha Lista (Favoritos):** Salva filmes, séries, doramas e canais prediletos usando `localStorage`.

---

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ (recomendado Node 20+)
- npm ou yarn / pnpm

### Instalação e Desenvolvimento
```bash
# 1. Instalar dependências
npm install

# 2. Iniciar servidor de desenvolvimento local
npm run dev
```

O projeto será iniciado em `http://localhost:5173`.

### Compilação de Produção
```bash
npm run build
npm run preview
```

---

## 🛠️ Tecnologias Utilizadas
- **React 19** + **TypeScript**
- **Vite** para compilação ultrarrápida
- **Tailwind CSS v4** + `@tailwindcss/vite`
- **Hls.js** para streaming ao vivo HTTP Live Streaming
- **Lucide Icons** para ícones de alta fidelidade
- **Glassmorphism & Obsidian Dark Theme** com efeitos de brilho ciano/roxo estelar
