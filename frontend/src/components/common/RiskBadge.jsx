import React from 'react';
import { ShieldCheck, AlertCircle, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RiskBadge({ score = 0, size = 'md' }) {
  let label = 'Low Risk';
  let color = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  let Icon = ShieldCheck;

  if (score > 75) {
    label = 'Critical Risk';
    color = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    Icon = ShieldAlert;
  } else if (score > 50) {
    label = 'Elevated Risk';
    color = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    Icon = AlertTriangle;
  } else if (score > 25) {
    label = 'Moderate Risk';
    color = 'bg-sky-500/10 text-sky-400 border-sky-500/30';
    Icon = AlertCircle;
  }

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${color}`}>
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{score}/100</span>
      <span className="text-[10px] opacity-80 uppercase tracking-wider">({label})</span>
    </span>
  );
}
