import React, { useState } from 'react';
import { api } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import RiskBadge from './common/RiskBadge';
import {
  Upload,
  FileText,
  X,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

const SAMPLE_TEMPLATES = {
  finance: {
    title: 'Cloud Infrastructure Vendor Invoice #INV-2026-904.txt',
    text: `INVOICE #INV-2026-904
Supplier: NeuralScale Compute Technologies Corp.
Invoice Date: 2026-10-15
Due Date: 2026-11-15
Department: Finance

Line Items:
1. 32x Dedicated H100 Tensor Pods Cluster - $86,400.00
2. Enterprise 400Gbps Direct Connect Interconnect - $12,800.00
3. 24/7 Mission Critical Engineering Support Tier - $8,000.00

Total Amount: $107,200.00
Payment Terms: Net 30
Regulatory Compliance: SOC2 Type II, ISO/IEC 27001
Notice: Amounts exceeding $50k require VP Finance dual-signature approval.`
  },
  operations: {
    title: 'Multi-Modal Logistics SLA Agreement Q4.txt',
    text: `OPERATIONS SLA & FREIGHT CONTRACT
Supplier: Global Apex Freight & Telemetry Systems
Effective Date: 2026-10-01
Due Date: 2026-12-31
Department: Operations

Line Items:
1. Automated Container Dispatch Telemetry API - $45,000.00
2. Real-Time Port Turnaround Anomaly Detector - $24,500.00

Total Amount: $69,500.00
Guaranteed SLA Uptime: 99.95%
Penalty: Breaches over 20 minutes incur 8% automatic rebate on monthly invoice.`
  },
  hr: {
    title: 'Executive AI Architect Candidate Dossier.txt',
    text: `CANDIDATE SCREENING REPORT
Candidate: Dr. Maya Lin (Staff AI Architect)
Department: HR & Talent Operations
Dossier ID: HR-CAN-8819

Qualifications & Experience:
1. 10+ Years Distributed Machine Learning Systems - Verified
2. Checkr Enterprise Background Verification - Clear (Zero flags)
3. Non-Disclosure & Non-Compete Clearance - Validated

Recommended Starting Compensation: $230,000.00 Base
Risk Score: 5 (Minimal / Compliant)`
  },
  support: {
    title: 'Tier-1 High Severity Escalation Incident Report.txt',
    text: `CUSTOMER SUPPORT INCIDENT LOG #TIC-9912
Client: Global Fintech Enterprises
Department: Customer Support
Reported: 2026-10-14

Details:
1. Core Webhook Gateway Timeout Spike (28 minutes)
2. Negative customer sentiment detected in 18 urgent tickets

Resolution:
Patch deployed. Zero data loss verified.
Total Billing Credit Allocated: $12,500.00
Compliance: SLA credit authorization required from Support Lead.`
  }
};

export default function DocumentUploadModal({ isOpen, onClose, onUploadSuccess }) {
  const { department: defaultDept } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('upload'); // 'upload' | 'text'
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(defaultDept === 'executive' ? 'finance' : defaultDept);
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractionResult, setExtractionResult] = useState(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      if (!title) {
        setTitle(selectedFile.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleLoadSample = (deptKey) => {
    const sample = SAMPLE_TEMPLATES[deptKey];
    if (sample) {
      setTitle(sample.title);
      setDepartment(deptKey);
      setRawText(sample.text);
      setActiveTab('text');
      addToast(`Loaded ${deptKey.toUpperCase()} sample document for analysis`, 'info');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      addToast('Please provide a document title.', 'warning');
      return;
    }

    if (activeTab === 'upload' && !file) {
      addToast('Please choose a file to upload or switch to text input.', 'warning');
      return;
    }

    if (activeTab === 'text' && !rawText.trim()) {
      addToast('Please enter document content to analyze.', 'warning');
      return;
    }

    setIsProcessing(true);
    setExtractionResult(null);

    try {
      let result;
      if (file && activeTab === 'upload') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('title', title);
        formData.append('department', department);
        if (rawText) formData.append('rawText', rawText);
        result = await api.documents.upload(formData);
      } else {
        result = await api.documents.upload({
          title,
          department,
          fileType: 'text/plain',
          rawText
        });
      }

      setExtractionResult(result);
      addToast('Document processed and analyzed with Google Gemini!', 'success');
      if (onUploadSuccess) onUploadSuccess(result.document);
    } catch (err) {
      addToast(err.message || 'Document processing failed.', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setTitle('');
    setRawText('');
    setExtractionResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl glass-panel-elevated border border-slate-800 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">AI Document & Invoice Ingestion</h2>
              <p className="text-xs text-slate-400">Extract entities, calculate risk scores, and trigger automated workflows</p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6">
          {!extractionResult ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Preset sample buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Quick Enterprise Samples:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('finance')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-left text-xs transition-all hover:bg-emerald-500/5"
                  >
                    <span className="font-semibold text-emerald-400 block">Finance</span>
                    <span className="text-[10px] text-slate-400">$107k GPU Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('operations')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-sky-500/50 text-left text-xs transition-all hover:bg-sky-500/5"
                  >
                    <span className="font-semibold text-sky-400 block">Operations</span>
                    <span className="text-[10px] text-slate-400">Logistics SLA</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('hr')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-left text-xs transition-all hover:bg-purple-500/5"
                  >
                    <span className="font-semibold text-purple-400 block">HR Lead</span>
                    <span className="text-[10px] text-slate-400">AI Dossier</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('support')}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50 text-left text-xs transition-all hover:bg-amber-500/5"
                  >
                    <span className="font-semibold text-amber-400 block">Support</span>
                    <span className="text-[10px] text-slate-400">P0 Incident</span>
                  </button>
                </div>
              </div>

              {/* Title & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Document Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Q4 GPU Server Cluster Invoice.pdf"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Department</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-sm text-white focus:outline-none focus:border-sky-500 capitalize"
                  >
                    <option value="operations">Operations</option>
                    <option value="finance">Finance</option>
                    <option value="hr">HR</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              {/* Input Tabs (File Upload vs Raw Text / OCR) */}
              <div className="flex border-b border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('upload')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === 'upload'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File (PDF / Image / TXT)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`pb-2 px-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === 'text'
                      ? 'border-sky-400 text-sky-400'
                      : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  OCR Text / Contract Editor
                </button>
              </div>

              {activeTab === 'upload' ? (
                <div className="border-2 border-dashed border-slate-800 hover:border-sky-500/50 rounded-2xl p-6 text-center transition-all bg-slate-900/40">
                  <input
                    type="file"
                    id="doc-file-input"
                    className="hidden"
                    onChange={handleFileChange}
                    accept=".pdf,.png,.jpg,.jpeg,.txt,.doc,.docx"
                  />
                  <label htmlFor="doc-file-input" className="cursor-pointer flex flex-col items-center">
                    <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center mb-3">
                      <Upload className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold text-white">
                      {file ? file.name : 'Click to select or drag document here'}
                    </span>
                    <span className="text-xs text-slate-400 mt-1">
                      {file ? `${(file.size / 1024).toFixed(1)} KB` : 'Supports PDF, TXT, Images up to 25MB'}
                    </span>
                  </label>
                </div>
              ) : (
                <div>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Paste invoice line items, SLA text, or employee dossier here for direct Gemini AI parsing..."
                    className="w-full p-3 rounded-xl bg-slate-900 border border-slate-800 font-mono text-xs text-slate-200 focus:outline-none focus:border-sky-500 resize-none"
                  />
                </div>
              )}

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-50 transition-all"
                >
                  {isProcessing ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      <span>Gemini Extracting Entities...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>Analyze with Gemini</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Extraction Results View */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-white">Gemini Extraction & Audit Complete</h4>
                  <p className="text-xs text-emerald-300">
                    Document successfully stored under Department RLS realm and structured into JSON entities.
                  </p>
                </div>
              </div>

              {/* Entity extraction card */}
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
                {(() => {
                  const doc = extractionResult?.document || extractionResult || {};
                  const extracted = doc.extracted_data || extractionResult?.extracted || {};
                  const riskScore = doc.risk_score ?? extracted.riskScore ?? 15;
                  return (
                    <>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Identified Supplier / Entity</span>
                          <h4 className="text-base font-bold text-white">
                            {extracted.supplierName || 'Enterprise Partner'}
                          </h4>
                        </div>
                        <RiskBadge score={riskScore} size="md" />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                        <div>
                          <span className="text-slate-400 block">Total Amount:</span>
                          <span className="text-sm font-bold text-white font-mono">
                            ${Number(extracted.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Due Date:</span>
                          <span className="text-sm font-medium text-slate-200">
                            {extracted.dueDate || 'N/A'}
                          </span>
                        </div>
                      </div>

                      {extracted.complianceNotes && (
                        <div className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800 text-xs">
                          <span className="text-sky-400 font-semibold block mb-0.5">Compliance & Audit Notes:</span>
                          <p className="text-slate-300">{extracted.complianceNotes}</p>
                        </div>
                      )}

                      {extracted.lineItems?.length > 0 && (
                        <div>
                          <span className="text-[11px] font-semibold text-slate-400 block mb-1">Parsed Line Items:</span>
                          <div className="space-y-1">
                            {extracted.lineItems.map((item, idx) => (
                              <div key={idx} className="flex justify-between items-center text-xs p-1.5 rounded bg-slate-950/40">
                                <span className="text-slate-300 truncate max-w-[280px]">{item.description}</span>
                                <span className="text-white font-mono font-semibold">${Number(item.amount).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              {/* Triggered Workflows notification */}
              {extractionResult.triggeredWorkflows?.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold mb-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Automated Workflows Triggered:</span>
                  </div>
                  {extractionResult.triggeredWorkflows.map((tw, i) => (
                    <p key={i} className="text-slate-300">
                      • <strong>{tw.name}:</strong> {tw.reason}
                    </p>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-3">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold"
                >
                  Done & View in Portal
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
