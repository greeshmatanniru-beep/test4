import React from 'react';
import ChatInterface from '../components/ChatInterface';
import { Bot, Sparkles, ShieldCheck } from 'lucide-react';

export default function ChatPage() {
  return (
    <div className="space-y-6 animate-in fade-in pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">Enterprise AI Co-Pilot</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Google Gemini 2.5 Flash</span>
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Conversational Knowledge Assistant
          </h1>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>RLS Document Grounding Active</span>
        </div>
      </div>

      <ChatInterface />
    </div>
  );
}
