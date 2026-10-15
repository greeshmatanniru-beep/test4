import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DepartmentBadge from '../components/common/DepartmentBadge';
import WorkflowBuilder from '../components/WorkflowBuilder';
import {
  GitBranch,
  Play,
  Pause,
  Plus,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
  X
} from 'lucide-react';

export default function WorkflowsPage() {
  const { user, department: userDept } = useAuth();
  const { addToast } = useToast();

  const [workflows, setWorkflows] = useState([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, [userDept]);

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const data = await api.workflows.getAll();
      setWorkflows(data.workflows || []);
    } catch (err) {
      addToast('Failed to load workflows under RLS', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (wf) => {
    const nextStatus = wf.status === 'active' ? 'paused' : 'active';
    try {
      await api.workflows.toggleStatus(wf.id, nextStatus);
      addToast(`Workflow is now ${nextStatus}`, 'info');
      loadWorkflows();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleExecuteWorkflow = async (wf) => {
    try {
      const result = await api.workflows.trigger(wf.id);
      setExecutionResult({
        workflowName: wf.name,
        result
      });
      addToast(`Workflow "${wf.name}" executed successfully!`, 'success');
    } catch (err) {
      addToast(err.message || 'Execution failed', 'error');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Automated Rules & Execution Engine</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Row Level Security Verified</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Workflow Automation Builder
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Link AI risk assessments, departmental notifications, and automated failover rules to enterprise operational events.
          </p>
        </div>

        <button
          onClick={() => setShowBuilder(!showBuilder)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all shrink-0"
        >
          {showBuilder ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          <span>{showBuilder ? 'Close Builder' : 'New Automation Rule'}</span>
        </button>
      </div>

      {/* Workflow Builder Form (Expandable) */}
      {showBuilder && (
        <WorkflowBuilder
          onWorkflowCreated={() => {
            setShowBuilder(false);
            loadWorkflows();
          }}
          onClose={() => setShowBuilder(false)}
        />
      )}

      {/* Execution Trace Result Notification Modal */}
      {executionResult && (
        <div className="p-6 rounded-2xl bg-slate-900 border border-emerald-500/40 space-y-4 animate-in fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
              <h3 className="text-sm font-bold text-white">
                Live Trace: "{executionResult.workflowName}" Executed
              </h3>
            </div>
            <button
              onClick={() => setExecutionResult(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              Dismiss
            </button>
          </div>

          <div className="space-y-2">
            {executionResult.result.trace?.map((step) => (
              <div key={step.step} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-mono font-bold text-[11px]">
                    {step.step}
                  </span>
                  <span className="text-slate-200">{step.details}</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono font-bold uppercase">{step.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active Workflows Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {workflows.map((wf) => {
          const isActive = wf.status === 'active';
          return (
            <div
              key={wf.id}
              className={`rounded-2xl glass-panel-elevated p-6 border transition-all flex flex-col justify-between ${
                isActive ? 'border-slate-800 hover:border-sky-500/40' : 'border-slate-800/40 opacity-70'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <DepartmentBadge department={wf.department} size="sm" />
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {wf.status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleToggleStatus(wf)}
                    className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                    title={isActive ? 'Pause Workflow' : 'Resume Workflow'}
                  >
                    {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1">{wf.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-4">
                  Trigger Event: <span className="text-sky-400">{wf.trigger_event}</span>
                </p>

                {/* Pipeline visual sequence */}
                <div className="space-y-1.5 mb-6">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                    Action Execution Pipeline:
                  </span>
                  {(wf.actions || []).map((action, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-slate-300 p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                      <span className="w-5 h-5 rounded bg-sky-500/15 text-sky-400 text-[10px] font-mono flex items-center justify-center font-bold">
                        {i + 1}
                      </span>
                      <span className="truncate">{action.type || 'Action Step'}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-500">
                  Created {new Date(wf.created_at).toLocaleDateString()}
                </span>

                <button
                  onClick={() => handleExecuteWorkflow(wf)}
                  disabled={!isActive}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-40 transition-all"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Execute Pipeline</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
