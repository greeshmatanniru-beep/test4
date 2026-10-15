import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { workflowSchema } from '@shared/validators';
import {
  GitBranch,
  Play,
  Plus,
  Trash2,
  ArrowRight,
  ShieldAlert,
  Zap,
  CheckCircle,
  Bell,
  Cpu,
  UserCheck
} from 'lucide-react';

const TRIGGER_PRESETS = [
  { id: 'invoice_amount_exceeds_threshold', label: 'Invoice Amount Exceeds Threshold ($10k+)', department: 'finance' },
  { id: 'sla_breach_detected', label: 'Operations Logistics SLA Breach Detected', department: 'operations' },
  { id: 'candidate_offer_accepted', label: 'HR Candidate Offer Acceptance Event', department: 'hr' },
  { id: 'negative_sentiment_score_spike', label: 'Urgent Negative Support Sentiment Spike', department: 'support' }
];

const ACTION_TYPES = [
  { id: 'ai_risk_assessment', label: 'AI Deep Risk Analysis (Gemini 2.5 Pro)', icon: Cpu },
  { id: 'require_approval', label: 'Require Manager / VP Digital Signoff', icon: UserCheck },
  { id: 'dispatch_alert', label: 'Dispatch Alert (Enterprise Webhook / Slack)', icon: Bell },
  { id: 'reroute_traffic', label: 'Autonomous Failover & Traffic Rerouting', icon: Zap },
  { id: 'provision_corporate_sso', label: 'Automate SSO & Resource Provisioning', icon: CheckCircle }
];

export default function WorkflowBuilder({ onWorkflowCreated, onClose }) {
  const { department: userDept } = useAuth();
  const { addToast } = useToast();

  const [name, setName] = useState('');
  const [department, setDepartment] = useState(userDept === 'executive' ? 'finance' : userDept);
  const [triggerEvent, setTriggerEvent] = useState(TRIGGER_PRESETS[0].id);
  const [actions, setActions] = useState([
    { type: 'ai_risk_assessment', model: 'gemini-2.5-pro', threshold: 10000 },
    { type: 'require_approval', role: 'manager', department: userDept === 'executive' ? 'finance' : userDept }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddAction = (actionType) => {
    setActions([...actions, { type: actionType, timestamp: Date.now() }]);
  };

  const handleRemoveAction = (index) => {
    if (actions.length <= 1) {
      addToast('A workflow must have at least one action step.', 'warning');
      return;
    }
    setActions(actions.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name,
      department,
      triggerEvent,
      actions
    };

    const validation = workflowSchema.safeParse(payload);
    if (!validation.success) {
      addToast(validation.error.errors[0]?.message || 'Validation failed', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await api.workflows.create(payload);
      addToast(`Workflow "${name}" created and deployed successfully!`, 'success');
      if (onWorkflowCreated) onWorkflowCreated(res.workflow);
      if (onClose) onClose();
    } catch (err) {
      addToast(err.message || 'Failed to create workflow', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Visual Workflow Builder</h3>
            <p className="text-xs text-slate-400">Assemble multi-agent AI actions triggered by enterprise operational events</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Workflow Rule Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High-Value Finance SLA Escalation"
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Department Domain</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 capitalize"
            >
              <option value="operations">Operations</option>
              <option value="finance">Finance</option>
              <option value="hr">HR</option>
              <option value="support">Customer Support</option>
            </select>
          </div>
        </div>

        {/* Trigger Event Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-2 uppercase tracking-wider">
            1. Trigger Event (Input Condition)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {TRIGGER_PRESETS.map((preset) => {
              const isSelected = triggerEvent === preset.id;
              return (
                <button
                  type="button"
                  key={preset.id}
                  onClick={() => setTriggerEvent(preset.id)}
                  className={`p-3 rounded-xl text-left border transition-all text-xs flex items-center gap-3 ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500/50 text-white shadow-glow-sm'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <Zap className={`w-4 h-4 shrink-0 ${isSelected ? 'text-sky-400' : 'text-slate-500'}`} />
                  <div>
                    <span className="font-semibold block">{preset.label}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{preset.department}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Pipeline representation */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              2. Action Execution Chain ({actions.length} Steps)
            </label>
          </div>

          <div className="space-y-3">
            {actions.map((act, idx) => {
              const matchType = ACTION_TYPES.find((a) => a.id === act.type) || ACTION_TYPES[0];
              const Icon = matchType.icon;
              return (
                <div key={idx} className="relative flex items-center gap-3">
                  <div className="flex-1 p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold font-mono">
                        {idx + 1}
                      </div>
                      <Icon className="w-4 h-4 text-sky-400" />
                      <div>
                        <span className="text-xs font-semibold text-white block">{matchType.label}</span>
                        <span className="text-[10px] text-slate-400 font-mono">Step #{idx + 1} in execution sequence</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveAction(idx)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Remove step"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick add action buttons */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">Add Step to Execution Chain:</span>
            <div className="flex flex-wrap gap-2">
              {ACTION_TYPES.map((act) => (
                <button
                  type="button"
                  key={act.id}
                  onClick={() => handleAddAction(act.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-[11px] text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-3 h-3 text-sky-400" />
                  <span>{act.label.split('(')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-50 transition-all"
          >
            <GitBranch className="w-4 h-4" />
            <span>{isSubmitting ? 'Registering Workflow...' : 'Deploy Automation Rule'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
