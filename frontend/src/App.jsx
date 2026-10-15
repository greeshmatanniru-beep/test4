import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import DocumentUploadModal from './components/DocumentUploadModal';

import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import TasksPage from './pages/TasksPage';
import WorkspacePage from './pages/WorkspacePage';
import DocumentsPage from './pages/DocumentsPage';
import WorkflowsPage from './pages/WorkflowsPage';
import ChatPage from './pages/ChatPage';
import AnalyticsPage from './pages/AnalyticsPage';
import SettingsPage from './pages/SettingsPage';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-sky-400">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
          <span className="text-xs font-mono tracking-widest uppercase">Initializing NexusAI Enterprise AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar onOpenUploadModal={() => setIsUploadModalOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ openUploadModal: () => setIsUploadModalOpen(true) }} />
        </main>
      </div>

      {/* Global Ingestion Modal */}
      <DocumentUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => {
          // Trigger refresh if needed
          window.dispatchEvent(new CustomEvent('corpmind:doc-uploaded'));
        }}
      />
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedLayout />}>
        <Route path="/dashboard" element={<DashboardWrapper />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/workspace" element={<WorkspaceWrapper />} />
        <Route path="/documents" element={<DocumentsWrapper />} />
        <Route path="/workflows" element={<WorkflowsPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}

// Helper wrapper components to pass modal trigger
import { useOutletContext } from 'react-router-dom';

function DashboardWrapper() {
  const { openUploadModal } = useOutletContext();
  return <DashboardPage onOpenUploadModal={openUploadModal} />;
}

function WorkspaceWrapper() {
  const { openUploadModal } = useOutletContext();
  return <WorkspacePage onOpenUploadModal={openUploadModal} />;
}

function DocumentsWrapper() {
  const { openUploadModal } = useOutletContext();
  return <DocumentsPage onOpenUploadModal={openUploadModal} />;
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ToastProvider>
  );
}
