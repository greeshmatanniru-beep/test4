import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import KPICard from '../components/KPICard';
import DepartmentBadge from '../components/common/DepartmentBadge';
import RiskBadge from '../components/common/RiskBadge';
import { ThroughputAreaChart } from '../components/AnalyticsChart';
import {
  GitBranch,
  FileText,
  ShieldAlert,
  Zap,
  TrendingUp,
  Cpu,
  Clock,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  Play,
  CheckSquare,
  ListTodo,
  Bot,
  Lightbulb,
  Building,
  Calendar,
  AlertOctagon,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

function PriorityBadge({ priority }) {
  const styles = {
    urgent: 'bg-rose-500/15 border-rose-500/30 text-rose-400',
    high: 'bg-amber-500/15 border-amber-500/30 text-amber-400',
    medium: 'bg-sky-500/15 border-sky-500/30 text-sky-400',
    low: 'bg-slate-800 border-slate-700 text-slate-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border ${styles[priority] || styles.medium}`}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }) {
  const styles = {
    pending: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
    in_progress: 'bg-sky-500/10 border-sky-500/30 text-sky-400',
    completed: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
    cancelled: 'bg-slate-800 border-slate-700 text-slate-400'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize border ${styles[status] || styles.pending}`}>
      {status ? status.replace('_', ' ') : 'pending'}
    </span>
  );
}

export default function DashboardPage({ onOpenUploadModal }) {
  const { user, department, role } = useAuth();
  const { addToast } = useToast();

  const [metrics, setMetrics] = useState(null);
  const [taskMetrics, setTaskMetrics] = useState(null);
  const [aiInsights, setAiInsights] = useState(null);
  const [upcomingTasks, setUpcomingTasks] = useState([]);
  const [recentDocs, setRecentDocs] = useState([]);
  const [workflows, setWorkflows] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [department]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [metricsData, docsData, wfData, logsData, taskMetricsData, insightsData, tasksData] = await Promise.all([
        api.analytics.getMetrics(),
        api.documents.getAll(),
        api.workflows.getAll(),
        api.analytics.getAuditLogs(),
        api.tasks.getMetrics().catch(() => ({ metrics: null })),
        api.analytics.getAIInsights().catch(() => ({ insights: null })),
        api.tasks.getAll().catch(() => ({ tasks: [] }))
      ]);

      setMetrics(metricsData?.metrics || metricsData || null);
      setRecentDocs(docsData?.documents || (Array.isArray(docsData) ? docsData : []));
      setWorkflows(wfData?.workflows || (Array.isArray(wfData) ? wfData : []));
      setAuditLogs(logsData?.logs?.slice(0, 5) || (Array.isArray(logsData) ? logsData.slice(0, 5) : []));
      setTaskMetrics(taskMetricsData?.metrics || taskMetricsData || null);
      setAiInsights(insightsData?.insights || insightsData || null);
      setUpcomingTasks(tasksData?.tasks ? tasksData.tasks.slice(0, 5) : (Array.isArray(tasksData) ? tasksData.slice(0, 5) : []));
    } catch (err) {
      console.warn('Dashboard telemetry notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTriggerQuickWorkflow = async (id, name) => {
    try {
      const res = await api.workflows.trigger(id);
      addToast(`Executed "${name}": ${res.stepsExecuted} actions completed!`, 'success');
      loadDashboardData();
    } catch (err) {
      addToast(err.message || 'Execution failed', 'error');
    }
  };

  const now = new Date();

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Welcome & Command Banner */}
      <div className="relative overflow-hidden rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-500/20 via-blue-600/10 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-400">NexusAI Command Center</span>
              <span className="text-slate-600">•</span>
              <DepartmentBadge department={department} size="sm" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Welcome, {user?.full_name?.split(' ')[0] || 'Enterprise Operator'}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time enterprise operations across Operations, Finance, HR, and Support.
              Database-backed live workload telemetry, mathematical overdue tracking, and Google Gemini AI insights.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/tasks"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              <CheckSquare className="w-4 h-4" />
              <span>Smart Requests</span>
            </Link>
            <button
              onClick={onOpenUploadModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span>Ingest Document</span>
            </button>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold transition-all"
            >
              <span>Knowledge Assistant</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* AI Insights Executive Briefing (Requirement 4) */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-sky-500/20 bg-gradient-to-b from-sky-950/20 to-slate-950/80 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 shadow-glow-sm">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-white tracking-tight">AI Executive Workload Insights</h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 font-mono">
                  Grounded with Gemini 2.5
                </span>
              </div>
              <p className="text-xs text-slate-400">Application-calculated metrics synthesized into executive recommendations</p>
            </div>
          </div>

          <button
            onClick={loadDashboardData}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white transition-all text-xs flex items-center gap-1.5"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        {isLoading ? (
          <div className="space-y-4 py-4">
            <div className="h-4 bg-slate-800/60 rounded animate-pulse w-3/4" />
            <div className="h-4 bg-slate-800/60 rounded animate-pulse w-1/2" />
          </div>
        ) : aiInsights ? (
          <div className="space-y-6">
            {/* Workload Summary Narrative */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 leading-relaxed text-xs sm:text-sm text-slate-200">
              <div className="flex items-center gap-2 mb-2 text-sky-400 text-xs font-bold uppercase tracking-wider">
                <Bot className="w-4 h-4" />
                <span>Executive Summary</span>
              </div>
              <p>{aiInsights.workloadSummary}</p>
            </div>

            {/* Urgent Issues & Recommended Next Actions Subgrid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Urgent Bottlenecks */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
                    <AlertOctagon className="w-4 h-4 text-rose-400" />
                    <span>Urgent Issues & Bottlenecks</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {aiInsights.urgentIssues?.length || 0} Flagged
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiInsights.urgentIssues && aiInsights.urgentIssues.length > 0 ? (
                    aiInsights.urgentIssues.map((issue, idx) => (
                      <div
                        key={idx}
                        className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                          issue.isOverdue
                            ? 'bg-rose-500/10 border-rose-500/30'
                            : 'bg-slate-950/60 border-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-semibold text-slate-200 truncate">{issue.title}</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <DepartmentBadge department={issue.department} size="sm" showIcon={false} />
                            <PriorityBadge priority={issue.priority} />
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-500" />
                            <span>Deadline: {new Date(issue.deadline).toLocaleDateString()}</span>
                          </span>
                          {issue.isOverdue && (
                            <span className="text-rose-400 font-bold text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-rose-500/20">
                              Overdue
                            </span>
                          )}
                        </div>

                        {issue.suggestedAction && (
                          <p className="text-[11px] text-sky-300 bg-sky-950/40 p-2 rounded border border-sky-800/40">
                            <strong>Recommended Triage:</strong> {issue.suggestedAction}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <span>No urgent bottlenecks detected in current sprint.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Recommended Next Actions */}
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                    <Lightbulb className="w-4 h-4 text-emerald-400" />
                    <span>Prioritized Next Actions</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    {aiInsights.recommendedActions?.length || 0} Steps
                  </span>
                </div>

                <div className="space-y-2.5">
                  {aiInsights.recommendedActions && aiInsights.recommendedActions.length > 0 ? (
                    aiInsights.recommendedActions.map((rec, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold text-[10px] flex items-center justify-center shrink-0">
                              {rec.step || idx + 1}
                            </span>
                            <span className="font-semibold text-slate-200">{rec.action}</span>
                          </div>
                          <PriorityBadge priority={rec.priority} />
                        </div>
                        <p className="text-[11px] text-slate-400 pl-7 leading-relaxed">
                          {rec.rationale}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-950/40 rounded-xl">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                      <span>Workflows operating smoothly across all departments.</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Primary KPI Grid (Requirement 3: Live Dashboard Database Counts) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <KPICard
          title="Total Structured Requests"
          value={taskMetrics ? taskMetrics.total : '—'}
          subtext={`${taskMetrics?.statusCounts?.in_progress || 0} in progress • ${taskMetrics?.statusCounts?.pending || 0} pending`}
          icon={CheckSquare}
          trend="+8 this week"
          trendDirection="up"
          color="corp"
          isLoading={isLoading}
        />
        <KPICard
          title="Overdue Requests"
          value={taskMetrics ? taskMetrics.overdueCount : '—'}
          subtext="Calculated via application logic (deadline < now)"
          icon={AlertTriangle}
          trend={taskMetrics?.overdueCount > 0 ? `${taskMetrics.overdueCount} require triage` : 'Zero overdue'}
          trendDirection={taskMetrics?.overdueCount > 0 ? 'down' : 'up'}
          color={taskMetrics?.overdueCount > 0 ? 'rose' : 'emerald'}
          isLoading={isLoading}
        />
        <KPICard
          title="Urgent & High Priority"
          value={taskMetrics ? (taskMetrics.priorityCounts?.urgent || 0) + (taskMetrics.priorityCounts?.high || 0) : '—'}
          subtext={`${taskMetrics?.priorityCounts?.urgent || 0} P0 Urgent • ${taskMetrics?.priorityCounts?.high || 0} High`}
          icon={ShieldAlert}
          trend={taskMetrics?.priorityCounts?.urgent > 0 ? 'High Attention' : 'Manageable'}
          trendDirection={taskMetrics?.priorityCounts?.urgent > 0 ? 'down' : 'up'}
          color="amber"
          isLoading={isLoading}
        />
        <KPICard
          title="Active Automations"
          value={metrics ? `${metrics.activeWorkflows} / ${metrics.totalWorkflows}` : '—'}
          subtext="Cross-departmental rules"
          icon={GitBranch}
          trend="+18.4%"
          trendDirection="up"
          color="purple"
          isLoading={isLoading}
        />
      </div>

      {/* Department Workload & Real Upcoming Deadlines (Requirement 3) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Workload Distribution */}
        <div className="lg:col-span-5 rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Department Workload</h2>
              <p className="text-xs text-slate-400">Active tasks grouped by authorized department</p>
            </div>
            <Link to="/tasks" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              <span>View All Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              { key: 'operations', label: 'Operations & Logistics', color: 'bg-sky-500' },
              { key: 'finance', label: 'Finance & Invoicing', color: 'bg-emerald-500' },
              { key: 'hr', label: 'HR & Talent Systems', color: 'bg-purple-500' },
              { key: 'support', label: 'Customer Support', color: 'bg-amber-500' }
            ].map(({ key, label, color }) => {
              const count = taskMetrics?.departmentWorkload?.[key] || 0;
              const total = taskMetrics?.total || 1;
              const pct = Math.round((count / total) * 100);

              return (
                <div key={key} className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <DepartmentBadge department={key} size="sm" />
                      <span className="font-semibold text-white">{label}</span>
                    </div>
                    <span className="font-mono text-slate-300 font-bold">{count} tasks ({pct}%)</span>
                  </div>

                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.max(pct, count > 0 ? 8 : 0)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Real Upcoming Deadlines & Triage Table */}
        <div className="lg:col-span-7 rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Upcoming Deadlines & Triage</h2>
              <p className="text-xs text-slate-400">Tasks approaching deadline with overdue indicators</p>
            </div>
            <Link to="/tasks" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              <span>Smart Requests</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="py-2.5 px-3">Task Details</th>
                  <th className="py-2.5 px-3">Dept</th>
                  <th className="py-2.5 px-3">Priority</th>
                  <th className="py-2.5 px-3">Deadline</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs">
                {upcomingTasks.length > 0 ? (
                  upcomingTasks.map((t) => {
                    const isOverdue = t.deadline && new Date(t.deadline) < now && t.status !== 'completed' && t.status !== 'cancelled';
                    return (
                      <tr key={t.id} className="hover:bg-slate-900/60 transition-colors">
                        <td className="py-2.5 px-3">
                          <Link to="/tasks" className="font-semibold text-white hover:text-sky-400 block truncate max-w-[220px]">
                            {t.title}
                          </Link>
                          <span className="text-[10px] text-slate-400 truncate block max-w-[220px]">
                            {t.suggested_action}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          <DepartmentBadge department={t.department} size="sm" showIcon={false} />
                        </td>
                        <td className="py-2.5 px-3">
                          <PriorityBadge priority={t.priority} />
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className={`font-mono text-[11px] ${isOverdue ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                              {t.deadline ? new Date(t.deadline).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
                            </span>
                            {isOverdue && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[9px] font-bold uppercase tracking-wider">
                                Late
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <StatusBadge status={t.status} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-xs text-slate-500">
                      No active tasks currently logged. Use "Smart Requests" to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Analytics Chart & System Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 rounded-2xl glass-panel-elevated p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Throughput & Automation Cadence</h2>
              <p className="text-xs text-slate-400">Tokens consumed vs automated workflow tasks executed today</p>
            </div>
            <Link to="/analytics" className="text-xs text-sky-400 hover:text-sky-300 font-semibold flex items-center gap-1">
              <span>View Detailed Metrics</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <ThroughputAreaChart data={metrics?.throughputTimeline} />
        </div>

        {/* System Health & Isolation Widget */}
        <div className="lg:col-span-4 rounded-2xl glass-panel-elevated p-6 border border-slate-800 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Security & Engine Health</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-slate-200">PostgreSQL RLS</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  ENFORCED
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-semibold text-slate-200">gemini-2.5-flash</span>
                </div>
                <span className="text-[10px] font-mono text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                  ONLINE
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Cpu className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-semibold text-slate-200">gemini-2.5-pro</span>
                </div>
                <span className="text-[10px] font-mono text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                  READY
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-semibold text-slate-200">System Availability</span>
                </div>
                <span className="text-[10px] font-mono text-white">99.98%</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-800 text-xs text-slate-400 flex items-center justify-between">
            <span>AI Token Engine:</span>
            <span className="font-mono text-white font-semibold">{Number(metrics?.totalTokensConsumed || 148500).toLocaleString()} tokens</span>
          </div>
        </div>
      </div>

      {/* Recent Workflows & Recent Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Automated Workflows */}
        <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Active Automated Workflows</h2>
              <p className="text-xs text-slate-400">Trigger simulated actions or edit rules</p>
            </div>
            <Link to="/workflows" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              Manage All
            </Link>
          </div>

          <div className="space-y-3">
            {workflows.slice(0, 3).map((wf) => (
              <div
                key={wf.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{wf.name}</span>
                    <DepartmentBadge department={wf.department} size="sm" showIcon={false} />
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">
                    Trigger: <span className="text-slate-300">{wf.trigger_event}</span>
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerQuickWorkflow(wf.id, wf.name)}
                  className="px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Test trigger"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Execute</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Analyzed Documents */}
        <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">Recently Analyzed Documents</h2>
              <p className="text-xs text-slate-400">Entities extracted & risk verified with Gemini</p>
            </div>
            <Link to="/documents" className="text-xs text-sky-400 hover:text-sky-300 font-semibold">
              Document Hub
            </Link>
          </div>

          <div className="space-y-3">
            {recentDocs.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="space-y-1 max-w-[280px]">
                  <span className="text-xs font-bold text-white block truncate">{doc.title}</span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>${Number(doc.extracted_data?.totalAmount || 0).toLocaleString()}</span>
                    <span>•</span>
                    <span className="truncate">{doc.extracted_data?.supplierName || 'Enterprise Partner'}</span>
                  </div>
                </div>

                <RiskBadge score={doc.risk_score} size="sm" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
