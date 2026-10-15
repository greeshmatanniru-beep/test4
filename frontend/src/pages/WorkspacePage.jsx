import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DepartmentBadge from '../components/common/DepartmentBadge';
import RiskBadge from '../components/common/RiskBadge';
import {
  Layers,
  DollarSign,
  Users,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Play,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Cpu,
  FileText
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function WorkspacePage({ onOpenUploadModal }) {
  const { role, department: userDept } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState(userDept === 'executive' ? 'operations' : userDept);

  const handleRunAction = (actionTitle, dept) => {
    addToast(`Dispatched operational directive: "${actionTitle}" for ${dept.toUpperCase()}`, 'success');
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Workspace Hub Header */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Departmental Intelligence Hub</span>
            <span className="text-slate-600">•</span>
            <DepartmentBadge department={activeTab} size="sm" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Specialized Department Operations
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Execute domain-specific automated tasks, monitor live SLA performance, and review AI triaging queues.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all shrink-0"
        >
          <FileText className="w-4 h-4" />
          <span>Ingest to {activeTab.toUpperCase()}</span>
        </button>
      </div>

      {/* Department Tabs Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { id: 'operations', label: 'Operations', icon: Layers, desc: 'Logistics & SLA Telemetry' },
          { id: 'finance', label: 'Finance', icon: DollarSign, desc: 'Invoices & Risk Limits' },
          { id: 'hr', label: 'Human Resources', icon: Users, desc: 'Onboarding & Screening' },
          { id: 'support', label: 'Customer Support', icon: Headphones, desc: 'Tickets & Sentiment' }
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all ${
                isSelected
                  ? 'bg-sky-500/15 border-sky-500/50 shadow-glow-sm'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-slate-400'}`} />
                {isSelected && <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />}
              </div>
              <h3 className="text-sm font-bold text-white">{tab.label}</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">{tab.desc}</p>
            </button>
          );
        })}
      </div>

      {/* Dynamic Department Content View */}
      {activeTab === 'operations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Carrier Fleet Uptime</span>
              <h4 className="text-2xl font-black text-white mt-1">99.98%</h4>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>+0.08% Above SLA Threshold</span>
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Multi-Modal Route Latency</span>
              <h4 className="text-2xl font-black text-white mt-1">14.2 ms</h4>
              <p className="text-xs text-sky-400 mt-2">Optimal API dispatch speeds</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Autonomous Reroutes Today</span>
              <h4 className="text-2xl font-black text-white mt-1">18 Routes</h4>
              <p className="text-xs text-slate-400 mt-2">Zero cargo delays reported</p>
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Operations Telemetry & Actions</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Apex Freight SLA Monitor</h4>
                  <p className="text-xs text-slate-400">Continuous telemetry verification against ISO-27001 standard</p>
                </div>
                <button
                  onClick={() => handleRunAction('Run Route Diagnostic Ping', 'operations')}
                  className="px-3.5 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold"
                >
                  Diagnostic Ping
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Logistics Carrier Failover Simulation</h4>
                  <p className="text-xs text-slate-400">Simulate container rerouting to Apex-Fleet-B secondary node</p>
                </div>
                <button
                  onClick={() => handleRunAction('Carrier Failover Handshake', 'operations')}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold"
                >
                  Trigger Failover
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'finance' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending Invoice Queue</span>
              <h4 className="text-2xl font-black text-white mt-1">$355,000</h4>
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>1 Invoice Exceeds $100k Limit</span>
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Early Settlement Rebates</span>
              <h4 className="text-2xl font-black text-white mt-1">$14,200</h4>
              <p className="text-xs text-emerald-400 mt-2">2/10 Net 30 terms unlocked</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Compliance Pass Rate</span>
              <h4 className="text-2xl font-black text-white mt-1">99.1%</h4>
              <p className="text-xs text-slate-400 mt-2">Audited via Gemini Pro schema</p>
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Financial Controls & Invoices</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-white">HyperTensor GPU Compute Cluster</h4>
                    <span className="text-xs font-mono font-bold text-emerald-400">$247,800.00</span>
                  </div>
                  <p className="text-xs text-slate-400">Risk Score 72/100 • Requires VP CFO digital approval</p>
                </div>
                <button
                  onClick={() => handleRunAction('CFO Authorization Digital Signoff', 'finance')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold"
                >
                  Authorize Spend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'hr' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Screened Candidates</span>
              <h4 className="text-2xl font-black text-white mt-1">48 Dossiers</h4>
              <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Zero Red Flags in Background Check</span>
              </p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Automated Onboardings</span>
              <h4 className="text-2xl font-black text-white mt-1">100%</h4>
              <p className="text-xs text-purple-400 mt-2">SSO & welcome packs dispatched</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Policy Compliance</span>
              <h4 className="text-2xl font-black text-white mt-1">96.8%</h4>
              <p className="text-xs text-slate-400 mt-2">Annual training certification</p>
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Talent Pipeline & Verification</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Dr. Aris Thorne (Lead AI Engineer)</h4>
                  <p className="text-xs text-slate-400">Risk Score: 8/100 (Clean) • Patents verified • Offer recommended</p>
                </div>
                <button
                  onClick={() => handleRunAction('Provision SSO & Welcome Packet', 'hr')}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 text-xs font-semibold"
                >
                  Provision SSO
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'support' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">First Response Time</span>
              <h4 className="text-2xl font-black text-white mt-1">6.4 min</h4>
              <p className="text-xs text-emerald-400 mt-2">Target &lt; 15 mins</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Sentiment Index</span>
              <h4 className="text-2xl font-black text-white mt-1">+0.82</h4>
              <p className="text-xs text-sky-400 mt-2">High Positive Sentiment</p>
            </div>
            <div className="p-5 rounded-2xl glass-panel border border-slate-800">
              <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">P0 Escalations Solved</span>
              <h4 className="text-2xl font-black text-white mt-1">100%</h4>
              <p className="text-xs text-slate-400 mt-2">Mitigated under credit window</p>
            </div>
          </div>

          <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Urgent Tickets & Incident Triage</h3>
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">#TIC-4089: OmniBank Webhook Timeout</h4>
                  <p className="text-xs text-slate-400">Negative sentiment mitigated • Patch v4.9.2 deployed</p>
                </div>
                <button
                  onClick={() => handleRunAction('Generate Executive Incident Postmortem', 'support')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold"
                >
                  Generate Postmortem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
