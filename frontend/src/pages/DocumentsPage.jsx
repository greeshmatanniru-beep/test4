import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DepartmentBadge from '../components/common/DepartmentBadge';
import RiskBadge from '../components/common/RiskBadge';
import {
  FileText,
  Search,
  Filter,
  Sparkles,
  Download,
  Eye,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  X,
  Code
} from 'lucide-react';

export default function DocumentsPage({ onOpenUploadModal }) {
  const { department: userDept } = useAuth();
  const { addToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deptFilter, setDeptFilter] = useState('all');
  const [showJsonRaw, setShowJsonRaw] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDocuments();
  }, [userDept]);

  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const data = await api.documents.getAll();
      setDocuments(data.documents || []);
    } catch (err) {
      addToast('Failed to fetch documents under RLS policies', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.extracted_data?.supplierName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = deptFilter === 'all' || doc.department === deptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-8 animate-in fade-in pb-12">
      {/* Header */}
      <div className="rounded-3xl glass-panel-elevated p-6 sm:p-8 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Document Intelligence Portal</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Gemini 2.5 Pro Schema Extraction</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Corporate Document & Invoice Portal
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-2xl leading-relaxed">
            Ingest PDFs, scan invoices, extract structured JSON schemas, and detect compliance risks automatically.
          </p>
        </div>

        <button
          onClick={onOpenUploadModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm transition-all shrink-0"
        >
          <Sparkles className="w-4 h-4" />
          <span>Upload & Analyze</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or vendor name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 self-stretch sm:self-auto">
          <Filter className="w-4 h-4 text-slate-400" />
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

      {/* Documents Table / Grid */}
      <div className="rounded-2xl glass-panel-elevated border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3.5 px-6">Document Title</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Identified Entity</th>
                <th className="py-3.5 px-6">Total Value</th>
                <th className="py-3.5 px-6">Risk Rating</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDocs.map((doc) => {
                const amount = doc.extracted_data?.totalAmount || 0;
                const supplier = doc.extracted_data?.supplierName || 'Enterprise Partner';
                return (
                  <tr key={doc.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-4 px-6 font-semibold text-white">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-sky-400">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="block truncate max-w-[240px]">{doc.title}</span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <DepartmentBadge department={doc.department} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-slate-300 font-medium truncate max-w-[180px]">
                      {supplier}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-white">
                      {amount > 0 ? `$${Number(amount).toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      <RiskBadge score={doc.risk_score} size="sm" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs font-semibold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Document Detail Modal / Drawer */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-2xl glass-panel-elevated border border-slate-800 shadow-2xl p-6 sm:p-8 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <DepartmentBadge department={selectedDoc.department} size="sm" />
                  <RiskBadge score={selectedDoc.risk_score} size="sm" />
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400">Extracted and validated against corporate policy</p>
              </div>

              <button
                onClick={() => setSelectedDoc(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Supplier / Entity:</span>
                  <span className="font-bold text-white text-sm">
                    {selectedDoc.extracted_data?.supplierName || 'Enterprise Partner'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Total Commitment:</span>
                  <span className="font-mono font-bold text-emerald-400 text-sm">
                    ${Number(selectedDoc.extracted_data?.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Due Date:</span>
                  <span className="text-slate-200">
                    {selectedDoc.extracted_data?.dueDate || 'Not Specified'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Processed Timestamp:</span>
                  <span className="text-slate-200">
                    {new Date(selectedDoc.created_at).toLocaleString()}
                  </span>
                </div>
              </div>

              {selectedDoc.extracted_data?.complianceNotes && (
                <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-xs">
                  <span className="text-sky-400 font-bold block mb-1">Compliance & Risk Audit:</span>
                  <p className="text-slate-200 leading-relaxed">
                    {selectedDoc.extracted_data.complianceNotes}
                  </p>
                </div>
              )}

              {/* Line items */}
              {selectedDoc.extracted_data?.lineItems?.length > 0 && (
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Line Item Breakdown
                  </span>
                  <div className="divide-y divide-slate-800/80 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden text-xs">
                    {selectedDoc.extracted_data.lineItems.map((item, idx) => (
                      <div key={idx} className="p-3 flex justify-between items-center">
                        <span className="text-slate-300">{item.description}</span>
                        <span className="font-mono font-bold text-white">${Number(item.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle Raw JSON */}
              <div>
                <button
                  type="button"
                  onClick={() => setShowJsonRaw(!showJsonRaw)}
                  className="flex items-center gap-1.5 text-xs text-sky-400 hover:text-sky-300 font-semibold"
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>{showJsonRaw ? 'Hide Raw JSON Schema' : 'View Raw Extracted JSON Schema'}</span>
                </button>

                {showJsonRaw && (
                  <pre className="mt-2 p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-sky-300 overflow-x-auto max-h-48">
                    {JSON.stringify(selectedDoc.extracted_data, null, 2)}
                  </pre>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedDoc(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
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
