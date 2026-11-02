import React from 'react';
import { useApp } from '../context/AppContext';
import { Tv, Sparkles, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { setCurrentTab } = useApp();

  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#05070e] text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-purple-600 p-[1px]">
                <div className="w-full h-full bg-[#070913] rounded-[7px] flex items-center justify-center">
                  <Tv className="w-4 h-4 text-cyan-400" />
                </div>
              </div>
              <span className="text-lg font-black tracking-wider text-white font-mono">
                SIRIUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">TV</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sua plataforma completa de streaming com TV ao Vivo, os melhores filmes, séries premiadas, doramas asiáticos exclusivos e cobertura esportiva em tempo real.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Navegação</h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-cyan-400 transition-colors">
                  Página Inicial
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('channels')} className="hover:text-cyan-400 transition-colors">
                  TV Ao Vivo & Canais
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('filmes' as any)} className="hover:text-cyan-400 transition-colors">
                  Filmes Populares
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('series')} className="hover:text-cyan-400 transition-colors">
                  Séries & Temporadas
                </button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('doramas')} className="hover:text-cyan-400 transition-colors">
                  Doramas (K-Drama & C-Drama)
                </button>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Canais Populares</h4>
            <ul className="space-y-2">
              <li className="hover:text-slate-300">TV Aberta (Globo, SBT, Record, Band)</li>
              <li className="hover:text-slate-300">Esportes (SporTV, ESPN, CazéTV)</li>
              <li className="hover:text-slate-300">Filmes (HBO, Telecine, Warner)</li>
              <li className="hover:text-slate-300">Notícias 24h (GloboNews, CNN Brasil)</li>
              <li className="hover:text-slate-300">Infantis (Cartoon Network, Discovery Kids)</li>
            </ul>
          </div>

          {/* Legal / Disclaimer */}
          <div className="space-y-2 text-[11px] text-slate-500 leading-relaxed">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs mb-3">Aviso Legal</h4>
            <p>
              O Sirius TV é uma interface e reprodutor indexador que organiza links públicos disponíveis na internet. Nenhum arquivo de mídia protegido por direitos autorais é hospedado em nossos servidores locais.
            </p>
            <p className="pt-2 text-slate-400">
              Personalizado com excelência para entretenimento de alta qualidade.
            </p>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 Sirius TV. Todos os direitos reservados.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Criado com</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>para a melhor experiência de streaming</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
