import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DepartmentBadge from '../components/common/DepartmentBadge';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  ArrowRight,
  ShieldAlert,
  Zap,
  Activity,
  Calendar,
  X,
  History,
  Check,
  RotateCcw,
  Edit3
} from 'lucide-react';

const SAMPLE_REQUESTS = [
  "Our primary payment webhook for OmniBank has been dropping 12% of callbacks since 9 AM, we need Tier 1 engineering escalation and legal SLA notification before 4 PM today.",
  "Vendor HyperTensor sent an urgent notice that 64x GPU node cluster has a power surge and we need an emergency inspection by Finance and Ops before 5 PM tomorrow.",
  "Candidate Dr. Maya Lin accepted the Staff AI Architect offer. We need to initiate background check, Okta SSO provisioning, and prepare AWS cluster credentials by Friday.",
  "Conduct an emergency route SLA compliance audit on Apex Freight fleet to check if route latency guarantees under 15ms are being violated."
];

export default function TasksPage() {
  const { user, department: userDept, role } = useAuth();
  const { addToast } = useToast();

  const [tasks, setTasks] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');

  // Smart Request Conversion State
  const [naturalRequest, setNaturalRequest] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [proposalModalOpen, setProposalModalOpen] = useState(false);
  const [taskProposal, setTaskProposal] = useState(null);

  // Task History / Audit Modal
  const [selectedTaskHistory, setSelectedTaskHistory] = useState(null);
  const [taskHistoryLogs, setTaskHistoryLogs] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    loadTasksAndMetrics();
  }, [userDept, statusFilter, priorityFilter, deptFilter]);

  const loadTasksAndMetrics = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, metricsRes] = await Promise.all([
        api.tasks.getAll({
          status: statusFilter,
          priority: priorityFilter,
          department: deptFilter,
          search: searchQuery
        }),
        api.tasks.getMetrics()
      ]);

      setTasks(tasksRes?.tasks || (Array.isArray(tasksRes) ? tasksRes : []));
      setMetrics(metricsRes?.metrics || metricsRes || null);
    } catch (err) {
      console.warn('Tasks notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConvertRequest = async (textToConvert = null) => {
    const text = textToConvert || naturalRequest;
    if (!text || text.trim().length < 5) {
      addToast('Please enter a natural language request to convert', 'warning');
      return;
    }

    setIsConverting(true);
    try {
      const res = await api.tasks.parseRequest(text, userDept);
      setTaskProposal(res.proposal);
      setProposalModalOpen(true);
      addToast('Request converted into task proposal! Review before saving.', 'success');
    } catch (err) {
      addToast(err.message || 'Failed to convert request', 'error');
    } finally {
      setIsConverting(false);
    }
  };

  const handleConfirmSaveTask = async (e) => {
    e.preventDefault();
    if (!taskProposal || !taskProposal.title.trim()) {
      addToast('Task title is required', 'warning');
      return;
    }

    try {
      await api.tasks.create(taskProposal);
      addToast(`Task "${taskProposal.title}" saved to persistent database!`, 'success');
      setProposalModalOpen(false);
      setTaskProposal(null);
      setNaturalRequest('');
      loadTasksAndMetrics();
    } catch (err) {
      addToast(err.message || 'Failed to save task', 'error');
    }
  };

  const handleUpdateStatus = async (taskId, newStatus) => {
    try {
      await api.tasks.updateStatus(taskId, newStatus);
      addToast(`Task status updated to ${newStatus}`, 'success');
      loadTasksAndMetrics();
    } catch (err) {
      addToast(err.message || 'Status update failed', 'error');
    }
  };

  const handleViewHistory = async (task) => {
    setSelectedTaskHistory(task);
    setIsLoadingHistory(true);
    try {
      const res = await api.tasks.getHistory(task.id);
      setTaskHistoryLogs(res.history || []);
    } catch (err) {
      addToast('Failed to load activity log for task', 'error');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const isTaskOverdue = (task) => {
    if (!task.deadline || task.status === 'completed' || task.status === 'cancelled') return false;
    return new Date(task.deadline) < new Date();
  };

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header Banner */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Natural-Language to Task Automation</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Verifiable Database Storage</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Smart Requests & Tasks Command
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Convert free-form natural language requests into structured tasks with category, priority, department, and deadlines. Review and confirm before persisting.
          </p>
        </div>

        <button
          onClick={() => {
            setTaskProposal({
              title: '',
              description: '',
              category: 'general',
              priority: 'medium',
              department: userDept === 'executive' ? 'operations' : userDept,
              deadline: new Date(Date.now() + 24 * 3600000).toISOString(),
              suggestedAction: 'Review and triage request'
            });
            setProposalModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Create Task Manually</span>
        </button>
      </div>

      {/* Smart Request NLP Input Box */}
      <div className="rounded-2xl glass-panel-elevated p-6 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-sky-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Smart Request AI Converter
          </h2>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={naturalRequest}
            onChange={(e) => setNaturalRequest(e.target.value)}
            placeholder="Type any operational request in plain English (e.g. 'Emergency notice: OmniBank webhook dropping callbacks, need tier 1 escalation before 4 PM')..."
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            onKeyDown={(e) => e.key === 'Enter' && handleConvertRequest()}
          />
          <button
            type="button"
            onClick={() => handleConvertRequest()}
            disabled={isConverting || !naturalRequest.trim()}
            className="px-6 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-40 transition-all flex items-center justify-center gap-2 shrink-0"
          >
            {isConverting ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                <span>Converting with AI...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Convert to Task</span>
              </>
            )}
          </button>
        </div>

        {/* Quick sample prompt chips */}
        <div className="pt-2 border-t border-slate-800/60">
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-2">Try sample operational requests:</span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_REQUESTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setNaturalRequest(sample);
                  handleConvertRequest(sample);
                }}
                className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-[11px] text-slate-300 hover:text-white transition-all text-left truncate max-w-md"
              >
                {sample}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Verifiable Metrics Row */}
      {metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl glass-panel border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Total Requests</span>
            <h4 className="text-2xl font-black text-white mt-1">{metrics.total}</h4>
            <span className="text-[11px] text-slate-500">Persistent in DB</span>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Overdue Requests</span>
            <div className="flex items-center gap-2 mt-1">
              <h4 className={`text-2xl font-black ${metrics.overdueCount > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                {metrics.overdueCount}
              </h4>
              {metrics.overdueCount > 0 && <AlertTriangle className="w-4 h-4 text-rose-400" />}
            </div>
            <span className="text-[10px] text-rose-300 font-mono">App Logic: deadline &lt; now</span>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Pending Triage</span>
            <h4 className="text-2xl font-black text-amber-400 mt-1">{metrics.statusCounts.pending}</h4>
            <span className="text-[11px] text-slate-500">Awaiting manager</span>
          </div>

          <div className="p-4 rounded-xl glass-panel border border-slate-800">
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Completed</span>
            <h4 className="text-2xl font-black text-emerald-400 mt-1">{metrics.statusCounts.completed}</h4>
            <span className="text-[11px] text-slate-500">Resolved successfully</span>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              loadTasksAndMetrics();
            }}
            placeholder="Search tasks, descriptions, actions..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto">
          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Department filter */}
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
          >
            <option value="all">All Departments</option>
            <option value="operations">Operations</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="support">Support</option>
          </select>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-2xl glass-panel-elevated border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Task Title & Details</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4">Deadline Status</th>
                <th className="py-3.5 px-4">Task Status</th>
                <th className="py-3.5 px-6 text-right">Actions & History</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-500">
                    No requests match your current filters. Type a request above to generate one!
                  </td>
                </tr>
              ) : (
                tasks.map((task) => {
                  const overdue = isTaskOverdue(task);
                  return (
                    <tr key={task.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-6 max-w-sm">
                        <div className="space-y-1">
                          <span className="font-bold text-white block text-sm">{task.title}</span>
                          <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                            {task.description}
                          </p>
                          {task.suggested_action && (
                            <p className="text-sky-400 text-[11px] font-mono">
                              <strong>Suggested:</strong> {task.suggested_action}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                            task.priority === 'urgent'
                              ? 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                              : task.priority === 'high'
                              ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                              : task.priority === 'medium'
                              ? 'bg-sky-500/15 text-sky-400 border-sky-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <DepartmentBadge department={task.department} size="sm" />
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <div className="space-y-0.5">
                          <span className="text-slate-300 block font-mono text-[11px]">
                            {task.deadline ? new Date(task.deadline).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No Deadline'}
                          </span>
                          {overdue ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/30">
                              <AlertTriangle className="w-3 h-3" />
                              <span>OVERDUE</span>
                            </span>
                          ) : (
                            <span className="text-[10px] text-emerald-400 font-mono">On Schedule</span>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <select
                          value={task.status}
                          onChange={(e) => handleUpdateStatus(task.id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-lg border focus:outline-none capitalize transition-all ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40'
                              : task.status === 'in_progress'
                              ? 'bg-sky-500/15 text-sky-300 border-sky-500/40'
                              : task.status === 'cancelled'
                              ? 'bg-slate-800 text-slate-400 border-slate-700'
                              : 'bg-amber-500/15 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="in_progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewHistory(task)}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 transition-colors"
                            title="View task activity history"
                          >
                            <History className="w-3.5 h-3.5" />
                          </button>

                          {task.status !== 'completed' && (
                            <button
                              onClick={() => handleUpdateStatus(task.id, 'completed')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold transition-all flex items-center gap-1"
                              title="Mark task completed"
                            >
                              <Check className="w-3 h-3" />
                              <span>Complete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Review Task Proposal Modal (Requirement 2: Let users review before saving) */}
      {proposalModalOpen && taskProposal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel-elevated border border-slate-800 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">AI Task Review</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400">Review & Edit Before Saving</span>
                </div>
                <h3 className="text-lg font-bold text-white">Confirm Structured Task</h3>
              </div>

              <button
                onClick={() => setProposalModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmSaveTask} className="py-4 space-y-4 text-xs">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Task Title</label>
                <input
                  type="text"
                  value={taskProposal.title}
                  onChange={(e) => setTaskProposal({ ...taskProposal, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={taskProposal.priority}
                    onChange={(e) => setTaskProposal({ ...taskProposal, priority: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
                  >
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Department</label>
                  <select
                    value={taskProposal.department}
                    onChange={(e) => setTaskProposal({ ...taskProposal, department: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500 capitalize"
                  >
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="support">Customer Support</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Deadline Date & Time</label>
                <input
                  type="datetime-local"
                  value={taskProposal.deadline ? new Date(taskProposal.deadline).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setTaskProposal({ ...taskProposal, deadline: new Date(e.target.value).toISOString() })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Detailed Description</label>
                <textarea
                  rows={3}
                  value={taskProposal.description || ''}
                  onChange={(e) => setTaskProposal({ ...taskProposal, description: e.target.value })}
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Suggested Next Action</label>
                <input
                  type="text"
                  value={taskProposal.suggestedAction || ''}
                  onChange={(e) => setTaskProposal({ ...taskProposal, suggestedAction: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setProposalModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Save Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task History & Activity Log Modal */}
      {selectedTaskHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-2xl glass-panel-elevated border border-slate-800 shadow-2xl p-6 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-sky-400" />
                <h3 className="text-sm font-bold text-white">Task Activity & Change Log</h3>
              </div>
              <button
                onClick={() => setSelectedTaskHistory(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <span className="font-bold text-white block mb-0.5">{selectedTaskHistory.title}</span>
                <span className="text-slate-400 block font-mono text-[11px]">ID: {selectedTaskHistory.id}</span>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail:</span>
                {isLoadingHistory ? (
                  <p className="text-xs text-slate-500">Loading audit history...</p>
                ) : taskHistoryLogs.length === 0 ? (
                  <p className="text-xs text-slate-500">Task registered in initial database state.</p>
                ) : (
                  taskHistoryLogs.map((log) => (
                    <div key={log.id} className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sky-400 font-mono text-[11px]">{log.action}</span>
                        <span className="text-slate-500 text-[10px]">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        Status changed from <strong>{log.details?.previousStatus}</strong> to <strong>{log.details?.newStatus}</strong> by {log.details?.updatedBy}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                onClick={() => setSelectedTaskHistory(null)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
