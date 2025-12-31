'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, LayoutDashboard,
  FileSearch, Settings, LogOut, Loader2, Zap
} from 'lucide-react';
import {
  AppSettings, UserWorkspace
} from '@/types';
import { Dashboard } from '@/Dashboard';
import { SettingsPage } from '@/SettingsPage';
import { ReferencePage } from '@/ReferencePage';
import { CompliancePage } from '@/CompliancePage';
import { SetupWizard } from '@/SetupWizard';
import { analyzeDocument } from '@/services/geminiService';
import { db } from '@/services/db';
import { getCurrentUser, signOut, AuthUser } from '@/services/auth';

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier l'authentification
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      loadWorkspace(currentUser.id);
    } else {
      setLoading(false);
      router.push('/login');
    }
  }, [router]);

  const loadWorkspace = async (userId: string) => {
    setLoading(true);
    try {
      const data = await db.getWorkspace(userId);
      setWorkspace(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: AppSettings) => {
    if (!user) return;
    try {
      await db.updateSettings(user.id, newSettings);
      setWorkspace(prev => prev ? { ...prev, settings: newSettings } : null);
    } catch (e) { console.error(e); }
  };

  const handleLogout = () => {
    signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-blue-600" size={48} />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Synchronisation Cloud...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (workspace && !workspace.settings.setupComplete) {
    return (
      <SetupWizard
        settings={workspace.settings}
        onComplete={updateSettings}
      />
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
      <aside className="w-72 bg-slate-900 text-slate-200 hidden md:flex flex-col p-8 sticky top-0 h-screen border-r border-slate-800 shadow-2xl">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-500/20">
            <ShieldCheck size={30} className="text-white" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white block">QualiApps</span>
            <span className="text-[10px] text-blue-400 uppercase font-black tracking-widest">SaaS Cloud</span>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem icon={<LayoutDashboard size={22} />} label="Dashboard" active={currentPage === 'dashboard'} onClick={() => setCurrentPage('dashboard')} />
          <SidebarItem icon={<FileSearch size={22} />} label="Analyseur IA" active={currentPage === 'reference'} onClick={() => setCurrentPage('reference')} />
          <SidebarLink href="/veille" icon={<Zap size={22} />} label="Veille" />
          <SidebarItem icon={<ShieldCheck size={22} />} label="Conformité" active={currentPage === 'compliance'} onClick={() => setCurrentPage('compliance')} />
          <SidebarItem icon={<Settings size={22} />} label="Paramètres" active={currentPage === 'settings'} onClick={() => setCurrentPage('settings')} />
        </nav>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <div className="mb-4 bg-slate-800/50 p-4 rounded-2xl border border-slate-700/50 overflow-hidden">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Organisme</p>
            <p className="text-xs font-bold text-white truncate" title={workspace?.settings.account.companyName}>
              {workspace?.settings.account.companyName || user.email}
            </p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-5 py-3 rounded-xl text-slate-400 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-widest">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          {workspace ? (
            <>
              {currentPage === 'dashboard' && (
                <Dashboard
                  organismType={workspace.settings.typology.organismType}
                  auditStates={workspace.auditStates}
                  ncList={workspace.ncList}
                  alertsCount={0}
                  docsCount={workspace.docs.length}
                  onNavigate={setCurrentPage}
                />
              )}
              {currentPage === 'settings' && <SettingsPage settings={workspace.settings} onUpdate={updateSettings} />}
              {currentPage === 'reference' && <ReferencePage reports={workspace.reports} isAnalyzing={isAnalyzing} onAnalyze={async (content, id) => {
                if (!user) return;
                setIsAnalyzing(true);
                try {
                  const report = await analyzeDocument(content, workspace.settings.typology.organismType, id);
                  if (report) await loadWorkspace(user.id);
                } finally { setIsAnalyzing(false); }
              }} />}
              {currentPage === 'compliance' && <CompliancePage />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
              <Loader2 className="animate-spin" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest">Initialisation du Workspace...</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'}`}>
    {icon}<span className="font-bold text-sm tracking-tight">{label}</span>
  </button>
);

const SidebarLink: React.FC<{ href: string; icon: React.ReactNode; label: string }> = ({ href, icon, label }) => (
  <Link href={href} className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all text-slate-400 hover:bg-slate-800 hover:text-slate-200">
    {icon}<span className="font-bold text-sm tracking-tight">{label}</span>
  </Link>
);

