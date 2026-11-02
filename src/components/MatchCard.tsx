import React from 'react';
import { Match } from '../types';
import { useApp } from '../context/AppContext';
import { Play, Trophy, Tv } from 'lucide-react';

interface MatchCardProps {
  match: Match;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match }) => {
  const { allChannels, openPlayer } = useApp();

  const handleWatchMatch = () => {
    const channel = allChannels.find((c) => c.slug === match.channelSlug) || allChannels[0];
    openPlayer(channel);
  };

  const isLive = match.status === 'Ao Vivo';

  return (
    <div
      onClick={handleWatchMatch}
      className="group relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950/90 border border-slate-800/80 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer select-none"
    >
      {/* Header with Championship & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-800/60 pb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            {match.championship}
          </span>
        </div>

        <div>
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
              AO VIVO
            </span>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
              {match.time}
            </span>
          )}
        </div>
      </div>

      {/* Teams Faceoff */}
      <div className="py-4 grid grid-cols-5 items-center gap-2">
        {/* Team 1 */}
        <div className="col-span-2 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 p-2 flex items-center justify-center border border-slate-700/50 group-hover:scale-105 transition-transform">
            <img
              src={match.team1.badge}
              alt={match.team1.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=' + match.team1.name.slice(0, 3);
              }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
            {match.team1.name}
          </span>
        </div>

        {/* Versus Indicator */}
        <div className="col-span-1 flex flex-col items-center justify-center">
          <span className="text-xs font-black text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-2 py-1 rounded-full">
            VS
          </span>
        </div>

        {/* Team 2 */}
        <div className="col-span-2 flex flex-col items-center text-center gap-2">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 p-2 flex items-center justify-center border border-slate-700/50 group-hover:scale-105 transition-transform">
            <img
              src={match.team2.badge}
              alt={match.team2.name}
              className="max-h-full max-w-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/60?text=' + match.team2.name.slice(0, 3);
              }}
            />
          </div>
          <span className="text-xs sm:text-sm font-bold text-white line-clamp-1">
            {match.team2.name}
          </span>
        </div>
      </div>

      {/* Footer with Channel & CTA */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Tv className="w-3.5 h-3.5 text-cyan-400" />
          <span className="truncate">{match.channelName}</span>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            handleWatchMatch();
          }}
          className="px-3 py-1.5 rounded-lg bg-cyan-400/10 hover:bg-cyan-400 hover:text-slate-950 text-cyan-400 border border-cyan-400/30 text-xs font-bold flex items-center gap-1.5 transition-all duration-200"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Assistir</span>
        </button>
      </div>
    </div>
  );
};

