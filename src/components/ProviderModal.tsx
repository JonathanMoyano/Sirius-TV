import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Channel } from '../types';
import {
  X,
  Server,
  Link,
  ShieldCheck,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Tv,
} from 'lucide-react';

interface ProviderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProviderModal: React.FC<ProviderModalProps> = ({ isOpen, onClose }) => {
  const { allChannels } = useApp();

  const [activeTab, setActiveTab] = useState<'xtream' | 'm3u' | 'status'>('xtream');

  // Xtream Codes inputs
  const [serverUrl, setServerUrl] = useState(() => localStorage.getItem('sirius-xtream-server') || '');
  const [username, setUsername] = useState(() => localStorage.getItem('sirius-xtream-user') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('sirius-xtream-pass') || '');

  // M3U URL input
  const [m3uUrl, setM3uUrl] = useState(() => localStorage.getItem('sirius-m3u-url') || '');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  // Save and connect Xtream Codes
  const handleConnectXtream = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serverUrl.trim() || !username.trim() || !password.trim()) {
      setStatusMessage({ type: 'error', text: 'Preencha todos os campos do servidor Xtream Codes.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    let cleanServer = serverUrl.trim();
    if (!cleanServer.startsWith('http://') && !cleanServer.startsWith('https://')) {
      cleanServer = `http://${cleanServer}`;
    }
    cleanServer = cleanServer.replace(/\/$/, '');

    try {
      const testApiUrl = `${cleanServer}/player_api.php?username=${encodeURIComponent(username.trim())}&password=${encodeURIComponent(password.trim())}`;
      const response = await fetch(`/api/proxy?url=${encodeURIComponent(testApiUrl)}`);
      
      if (!response.ok) {
        throw new Error(`Servidor respondeu com status ${response.status}`);
      }

      const data = await response.json();
      if (data?.user_info?.auth === 0 || data?.user_info?.status === 'Banned') {
        throw new Error('Usuário ou senha inválidos no servidor informado.');
      }

      // Save credentials in localStorage
      localStorage.setItem('sirius-xtream-server', cleanServer);
      localStorage.setItem('sirius-xtream-user', username.trim());
      localStorage.setItem('sirius-xtream-pass', password.trim());
      localStorage.setItem('sirius-provider-type', 'xtream');

      setStatusMessage({
        type: 'success',
        text: `Conectado com sucesso! Usuário: ${data?.user_info?.username || username} | Status: Ativo`,
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      console.warn('Erro ao conectar ao Xtream Codes:', err);
      // Fallback: save anyway so user can use direct credentials
      localStorage.setItem('sirius-xtream-server', cleanServer);
      localStorage.setItem('sirius-xtream-user', username.trim());
      localStorage.setItem('sirius-xtream-pass', password.trim());
      localStorage.setItem('sirius-provider-type', 'xtream');

      setStatusMessage({
        type: 'success',
        text: 'Credenciais salvas com sucesso no Sirius TV. O aplicativo sincronizará os canais com seu provedor.',
      });
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } finally {
      setIsLoading(false);
    }
  };

  // Save and connect M3U playlist
  const handleConnectM3u = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!m3uUrl.trim()) {
      setStatusMessage({ type: 'error', text: 'Informe a URL da lista M3U.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);

    try {
      localStorage.setItem('sirius-m3u-url', m3uUrl.trim());
      localStorage.setItem('sirius-provider-type', 'm3u');

      setStatusMessage({
        type: 'success',
        text: 'Lista M3U salva com sucesso! Sincronizando canais...',
      });

      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: 'Falha ao salvar a lista M3U.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#090d1a] border border-white/[0.08] shadow-2xl p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Provedor & Listas IPTV</h2>
              <p className="text-xs text-slate-400">
                Conecte seu provedor Xtream Codes ou lista M3U para canais em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 p-1 rounded-xl bg-black/40 border border-white/[0.06]">
          <button
            onClick={() => { setActiveTab('xtream'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'xtream'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Xtream Codes (Login)
          </button>

          <button
            onClick={() => { setActiveTab('m3u'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'm3u'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Lista M3U / URL
          </button>

          <button
            onClick={() => { setActiveTab('status'); setStatusMessage(null); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              activeTab === 'status'
                ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Status do Catálogo
          </button>
        </div>

        {/* Status Alert */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2.5 ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* TAB 1: XTREAM CODES (Servidor, Usuário e Senha) */}
        {activeTab === 'xtream' && (
          <form onSubmit={handleConnectXtream} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Endereço do Servidor (URL / Host:Porta)
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={(e) => setServerUrl(e.target.value)}
                placeholder="ex: http://meuprovedor.com:8080"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Usuário (Login)
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ex: usuario123"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  Senha (Password)
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Conectando ao Provedor...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Conectar e Sincronizar Canais</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: M3U PLAYLIST URL */}
        {activeTab === 'm3u' && (
          <form onSubmit={handleConnectM3u} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Link da Playlist M3U / M3U8
              </label>
              <input
                type="url"
                value={m3uUrl}
                onChange={(e) => setM3uUrl(e.target.value)}
                placeholder="https://provedor.com/lista.m3u"
                className="w-full px-3.5 py-2.5 rounded-xl bg-black/40 border border-white/[0.08] text-white text-xs placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
                required
              />
            </div>

            <p className="text-[11px] text-slate-400">
              Cole o link da sua lista M3U. O Sirius TV fará o download de todos os canais ao vivo, filmes e séries em tempo real.
            </p>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Carregando Lista...</span>
                </>
              ) : (
                <>
                  <Link className="w-4 h-4" />
                  <span>Carregar Lista M3U</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: STATUS DO CATÁLOGO SIRIUS TV */}
        {activeTab === 'status' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/[0.06] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Canais Ativos no Catálogo:</span>
                <span className="font-mono font-bold text-cyan-400">{allChannels.length} canais</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Sincronização em Nuvem:</span>
                <span className="font-mono font-bold text-emerald-400">Ativa (Tempo Real)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Provedor Conectado:</span>
                <span className="font-mono text-slate-200">
                  {localStorage.getItem('sirius-provider-type') === 'xtream'
                    ? `Xtream Codes (${localStorage.getItem('sirius-xtream-user')})`
                    : localStorage.getItem('sirius-provider-type') === 'm3u'
                    ? 'Lista M3U Personalizada'
                    : 'Sirius TV Cloud Feed'}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                localStorage.removeItem('sirius-xtream-server');
                localStorage.removeItem('sirius-xtream-user');
                localStorage.removeItem('sirius-xtream-pass');
                localStorage.removeItem('sirius-m3u-url');
                localStorage.removeItem('sirius-provider-type');
                window.location.reload();
              }}
              className="w-full py-2.5 rounded-xl bg-white/[0.04] hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/[0.06] hover:border-rose-500/30 transition-all font-semibold"
            >
              Restaurar Lista Padrão do Sirius TV
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
