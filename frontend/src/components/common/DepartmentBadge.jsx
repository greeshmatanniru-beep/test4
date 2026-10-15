import React from 'react';
import { Layers, DollarSign, Users, Headphones, Shield } from 'lucide-react';

export const DEPARTMENT_CONFIG = {
  operations: {
    label: 'Operations',
    bg: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
    dot: 'bg-sky-400',
    icon: Layers
  },
  finance: {
    label: 'Finance',
    bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
    icon: DollarSign
  },
  hr: {
    label: 'Human Resources',
    bg: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
    icon: Users
  },
  support: {
    label: 'Customer Support',
    bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
    icon: Headphones
  },
  executive: {
    label: 'Executive (Admin)',
    bg: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    dot: 'bg-indigo-400',
    icon: Shield
  }
};

export default function DepartmentBadge({ department, showIcon = true, size = 'md' }) {
  const deptKey = (department || 'operations').toLowerCase();
  const config = DEPARTMENT_CONFIG[deptKey] || DEPARTMENT_CONFIG.operations;
  const Icon = config.icon;

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border ${sizeClasses} ${config.bg}`}>
      {showIcon && <Icon className="w-3.5 h-3.5 shrink-0" />}
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
