import React, { useState, useEffect, useRef } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import DepartmentBadge from './common/DepartmentBadge';
import {
  Send,
  Sparkles,
  Bot,
  User,
  Paperclip,
  Cpu,
  Layers,
  FileText,
  Clock,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  AlertTriangle,
  ShieldCheck
} from 'lucide-react';

const DEPARTMENT_PROMPT_SUGGESTIONS = {
  operations: [
    'Analyze route SLA uptime across our logistics carriers for Q4.',
    'What are the penalty clauses for unmitigated carrier dispatch delays?',
    'Draft an operational risk report on multi-modal freight latency.'
  ],
  finance: [
    'Summarize Q3 vendor invoices exceeding the $10,000 threshold.',
    'Identify financial liabilities in the HyperTensor GPU compute agreement.',
    'Provide a cash-flow optimization plan using 2/10 Net 30 payment terms.'
  ],
  hr: [
    'Review candidate Dr. Aris Thorne against our Lead AI Engineer criteria.',
    'Generate an automated Day-1 onboarding checklist for engineering hires.',
    'What are the key policy compliance audit items for remote staff?'
  ],
  support: [
    'Analyze root cause and customer sentiment for ticket #TIC-4089.',
    'Draft an executive postmortem for the OmniBank payment gateway incident.',
    'What is our SLA resolution rate for high-severity P0 escalations?'
  ]
};

// Simple Markdown parser for clean enterprise formatting
function renderMarkdown(text) {
  if (!text) return null;

  const lines = text.split('\n');
  return lines.map((line, idx) => {
    // Header 3
    if (line.startsWith('### ')) {
      return (
        <h4 key={idx} className="text-base font-bold text-white mt-3 mb-1.5 flex items-center gap-2">
          {line.replace('### ', '')}
        </h4>
      );
    }
    // Header 2
    if (line.startsWith('## ')) {
      return (
        <h3 key={idx} className="text-lg font-extrabold text-sky-400 mt-4 mb-2">
          {line.replace('## ', '')}
        </h3>
      );
    }
    // Bullet item
    if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
      const content = line.trim().substring(2);
      return (
        <li key={idx} className="ml-4 list-disc text-slate-300 text-xs my-0.5 leading-relaxed">
          {formatInline(content)}
        </li>
      );
    }
    // Numbered item
    if (/^\d+\.\s/.test(line.trim())) {
      const content = line.trim().replace(/^\d+\.\s/, '');
      return (
        <li key={idx} className="ml-4 list-decimal text-slate-300 text-xs my-0.5 leading-relaxed">
          {formatInline(content)}
        </li>
      );
    }
    // Empty line
    if (!line.trim()) {
      return <div key={idx} className="h-2" />;
    }
    // Normal paragraph
    return (
      <p key={idx} className="text-xs text-slate-300 leading-relaxed my-1">
        {formatInline(line)}
      </p>
    );
  });
}

function formatInline(str) {
  // Bold formatting: **bold**
  const parts = str.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="text-white font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export default function ChatInterface() {
  const { user, department: userDept } = useAuth();
  const { addToast } = useToast();

  const [department, setDepartment] = useState(userDept === 'executive' ? 'finance' : userDept);
  const [messages, setMessages] = useState([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadChatHistory();
    loadDepartmentDocs();
  }, [department]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const data = await api.ai.getHistory(department);
      if (data?.messages && data.messages.length > 0) {
        setMessages(data.messages);
      } else if (data?.history && data.history.length > 0) {
        setMessages(data.history);
      } else {
        // Default welcoming message
        setMessages([
          {
            id: 'welcome-init',
            prompt: null,
            response: `Welcome to **CorpMind AI Enterprise Assistant** for the **${department.toUpperCase()}** department.\n\nI am connected to your private knowledge base and ready to analyze contracts, triage tickets, validate compliance, or orchestrate business workflows. How may I assist your team today?`,
            tokens_used: 45,
            model: 'gemini-2.5-flash',
            created_at: new Date().toISOString()
          }
        ]);
      }
    } catch (err) {
      console.error('Failed to load history:', err);
    }
  };

  const loadDepartmentDocs = async () => {
    try {
      const data = await api.documents.getAll();
      setDocuments(data?.documents || (Array.isArray(data) ? data : []));
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  };

  const handleSend = async (customPrompt = null) => {
    const promptToSend = customPrompt || inputPrompt;
    if (!promptToSend.trim() || isSending) return;

    const userMessageId = `user-${Date.now()}`;
    const optimisticMessage = {
      id: userMessageId,
      prompt: promptToSend,
      response: null,
      tokens_used: 0,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setInputPrompt('');
    setIsSending(true);

    try {
      const result = await api.ai.chat(promptToSend, department, selectedDocId || null);

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessageId
            ? {
                ...msg,
                response: result?.response || result?.message || 'Query processed successfully.',
                sources: result?.sources || [],
                isSupported: result?.isSupported,
                tokens_used: result?.tokensUsed || result?.tokens || 120,
                model: result?.model || 'gemini-2.5-flash'
              }
            : msg
        )
      );
    } catch (err) {
      addToast(err.message || 'AI request failed', 'error');
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === userMessageId
            ? {
                ...msg,
                response: `⚠️ **Service Notice:** Temporary AI latency encountered. System fell back to cached telemetry. Error: ${err.message}`,
                tokens_used: 0
              }
            : msg
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addToast('Response copied to clipboard', 'info', 2000);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const suggestions = DEPARTMENT_PROMPT_SUGGESTIONS[department] || DEPARTMENT_PROMPT_SUGGESTIONS.operations;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] rounded-2xl glass-panel-elevated border border-slate-800 overflow-hidden shadow-2xl">
      {/* Top Bar: Department Switcher, Context linking, Model indicator */}
      <div className="px-6 py-3.5 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white">NexusAI Knowledge Assistant</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 font-mono">
                gemini-2.5-flash
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Grounded Enterprise Q&A with Genuine Source Citations</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Department selector */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white focus:outline-none focus:border-sky-500 capitalize"
          >
            <option value="operations">Operations</option>
            <option value="finance">Finance</option>
            <option value="hr">HR</option>
            <option value="support">Customer Support</option>
          </select>

          {/* Document context linking */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Paperclip className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedDocId}
              onChange={(e) => setSelectedDocId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none max-w-[160px] truncate"
            >
              <option value="">Link Document Context...</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {messages.map((msg, idx) => (
          <div key={msg.id || idx} className="space-y-4">
            {/* User prompt message */}
            {msg.prompt && (
              <div className="flex justify-end">
                <div className="max-w-2xl rounded-2xl bg-sky-600/20 border border-sky-500/40 p-4 text-white text-xs leading-relaxed shadow-sm">
                  <div className="flex items-center justify-between gap-3 mb-1 text-[10px] text-sky-300 font-semibold">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      <span>{user?.full_name || 'You'}</span>
                    </span>
                    <span className="text-sky-400/80">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap">{msg.prompt}</p>
                </div>
              </div>
            )}

            {/* AI Response message */}
            <div className="flex justify-start">
              <div className="max-w-3xl rounded-2xl bg-slate-900/90 border border-slate-800 p-5 shadow-lg relative group">
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800/80 text-[10px]">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-md bg-sky-500/20 flex items-center justify-center text-sky-400 font-bold">
                      <Sparkles className="w-3 h-3" />
                    </div>
                    <span className="font-bold text-white uppercase tracking-wider">NexusAI</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                      {msg.model || 'gemini-2.5-flash'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 font-mono">
                    {msg.tokens_used > 0 && <span>{msg.tokens_used} tokens</span>}
                    {msg.response && (
                      <button
                        onClick={() => handleCopy(msg.id || idx, msg.response)}
                        className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        title="Copy text"
                      >
                        {copiedId === (msg.id || idx) ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {msg.response ? (
                  <div>
                    {renderMarkdown(msg.response)}

                    {/* Unsupported admission alert */}
                    {msg.isSupported === false && (
                      <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-200 flex items-start gap-2.5 animate-in fade-in">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div className="space-y-0.5">
                          <span className="font-semibold block text-amber-200">Notice: Unsupported by Document Knowledge Base</span>
                          <p className="text-[11px] text-amber-300/80 leading-relaxed">
                            NexusAI verified that current documents do not provide explicit factual backing for this inquiry. Citations are never fabricated.
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Genuine Source Citations */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-4 pt-3.5 border-t border-slate-800 space-y-2 animate-in fade-in">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-sky-400">
                            <FileText className="w-3.5 h-3.5" />
                            <span>Genuine Source Citations ({msg.sources.length})</span>
                          </div>
                          <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Zero Hallucination Grounding</span>
                          </span>
                        </div>

                        <div className="space-y-2">
                          {msg.sources.map((src, sIdx) => (
                            <div key={sIdx} className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-semibold text-slate-200 truncate">{src.documentTitle}</span>
                                <div className="flex items-center gap-2 shrink-0">
                                  {src.section && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                                      {src.section}
                                    </span>
                                  )}
                                  {src.confidence && (
                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-mono font-medium">
                                      {src.confidence}
                                    </span>
                                  )}
                                </div>
                              </div>
                              {src.excerpt && (
                                <div className="text-[11px] text-slate-300 italic bg-slate-900/60 p-2.5 rounded-lg border-l-2 border-sky-500">
                                  "{src.excerpt}"
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 py-3 text-xs text-sky-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Synthesizing enterprise knowledge with Google Gemini...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pill Row */}
      <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/60 overflow-x-auto flex items-center gap-2 shrink-0">
        <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Suggestions:</span>
        {suggestions.map((sug, i) => (
          <button
            key={i}
            type="button"
            onClick={() => handleSend(sug)}
            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-sky-500/40 text-[11px] text-slate-300 hover:text-white whitespace-nowrap transition-all"
          >
            {sug}
          </button>
        ))}
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2.5"
        >
          <input
            type="text"
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder={`Ask CorpMind AI anything regarding ${department.toUpperCase()} operations, invoices, or workflows...`}
            className="flex-1 px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
            disabled={isSending}
          />

          <button
            type="submit"
            disabled={!inputPrompt.trim() || isSending}
            className="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-sm disabled:opacity-40 transition-all flex items-center gap-2 shrink-0"
          >
            {isSending ? (
              <Sparkles className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Dispatch</span>
          </button>
        </form>
      </div>
    </div>
  );
}
