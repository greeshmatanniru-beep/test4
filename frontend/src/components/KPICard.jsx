import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

export default function KPICard({
  title,
  value,
  subtext,
  icon: Icon,
  trend,
  trendDirection = 'up',
  color = 'corp',
  isLoading = false
}) {
  const colorMap = {
    corp: 'from-sky-500/20 to-blue-600/5 text-sky-400 border-sky-500/20',
    emerald: 'from-emerald-500/20 to-teal-600/5 text-emerald-400 border-emerald-500/20',
    amber: 'from-amber-500/20 to-orange-600/5 text-amber-400 border-amber-500/20',
    purple: 'from-purple-500/20 to-indigo-600/5 text-purple-400 border-purple-500/20',
    rose: 'from-rose-500/20 to-red-600/5 text-rose-400 border-rose-500/20'
  };

  const selectedTheme = colorMap[color] || colorMap.corp;

  return (
    <div className="relative group overflow-hidden rounded-2xl glass-panel p-6 border transition-all duration-300 hover:border-sky-500/40 hover:shadow-glow-sm">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${selectedTheme} rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none opacity-40 group-hover:opacity-75 transition-opacity`} />
      
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">{title}</p>
          {isLoading ? (
            <div className="h-9 w-28 bg-slate-800/80 animate-pulse rounded-lg my-1" />
          ) : (
            <h3 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight">{value}</h3>
          )}
        </div>
        
        {Icon && (
          <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 shadow-inner group-hover:scale-105 transition-transform">
            <Icon className="w-5 h-5 text-sky-400" />
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-800/70">
        <span className="text-slate-400 font-medium truncate">{subtext}</span>
        
        {trend && (
          <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${
            trendDirection === 'up'
              ? 'text-emerald-400 bg-emerald-500/10'
              : trendDirection === 'down'
              ? 'text-rose-400 bg-rose-500/10'
              : 'text-slate-400 bg-slate-800'
          }`}>
            {trendDirection === 'up' && <TrendingUp className="w-3.5 h-3.5" />}
            {trendDirection === 'down' && <TrendingDown className="w-3.5 h-3.5" />}
            {trendDirection === 'neutral' && <Minus className="w-3.5 h-3.5" />}
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
