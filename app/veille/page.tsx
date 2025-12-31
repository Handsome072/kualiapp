'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck, LayoutDashboard, FileSearch, Settings,
  LogOut, Loader2, Zap, ChevronLeft
} from 'lucide-react';
import { VeillePage } from '@/VeillePage';
import { getCurrentUser, signOut, AuthUser } from '@/services/auth';
import { db } from '@/services/db';
import { UserWorkspace } from '@/types';

export default function VeillePageRoute() {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [workspace, setWorkspace] = useState<UserWorkspace | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  return (
    <div className="min-h-screen flex bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
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
          <SidebarLink href="/dashboard" icon={<LayoutDashboard size={22} />} label="Dashboard" active={false} />
          <SidebarLink href="/dashboard?page=reference" icon={<FileSearch size={22} />} label="Analyseur IA" active={false} />
          <SidebarLink href="/veille" icon={<Zap size={22} />} label="Veille" active={true} />
          <SidebarLink href="/dashboard?page=compliance" icon={<ShieldCheck size={22} />} label="Conformité" active={false} />
          <SidebarLink href="/dashboard?page=settings" icon={<Settings size={22} />} label="Paramètres" active={false} />
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

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto h-screen scrollbar-hide">
        <div className="max-w-6xl mx-auto">
          {/* Mobile back button */}
          <div className="md:hidden mb-6">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-700 text-sm font-bold">
              <ChevronLeft size={18} /> Retour au Dashboard
            </Link>
          </div>
          
          {/* VeillePage component - affiche tous les articles par défaut */}
          <VeillePage />
        </div>
      </main>
    </div>
  );
}

// Composant SidebarLink pour navigation avec Next.js Link
const SidebarLink: React.FC<{
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}> = ({ href, icon, label, active }) => (
  <Link
    href={href}
    className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
      active
        ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20 scale-105'
        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
    }`}
  >
    {icon}
    <span className="font-bold text-sm tracking-tight">{label}</span>
  </Link>
);

