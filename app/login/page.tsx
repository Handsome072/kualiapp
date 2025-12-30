'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, AlertCircle, Loader2, Mail, Lock as LockIcon, ShieldAlert } from 'lucide-react';
import { signIn, getCurrentUser } from '@/services/auth';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Rediriger si déjà connecté
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      router.push('/dashboard');
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('[LoginPage] Formulaire soumis');
    console.log('[LoginPage] Email:', email, 'Password length:', password.length);

    setLoading(true);
    setError(null);

    try {
      console.log('[LoginPage] Appel signIn...');
      const result = await signIn(email, password);
      console.log('[LoginPage] Résultat signIn:', result);

      if (!result.success) {
        console.log('[LoginPage] Échec connexion:', result.message);
        setError(result.message);
        setLoading(false);
        return;
      }

      console.log('[LoginPage] Connexion réussie, redirection vers /dashboard');
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[LoginPage] Exception:', err);
      setError(err.message || "Une erreur est survenue.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        <div className="bg-white rounded-[40px] shadow-2xl overflow-hidden border border-white/10">
          <div className="p-10 pt-12 text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-blue-500/20 mb-6 rotate-3 hover:rotate-0 transition-transform duration-500">
              <ShieldCheck size={44} className="text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">QualiApps <span className="text-blue-600">Cloud</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mt-2">Connexion</p>
          </div>

          <form onSubmit={handleLogin} className="px-10 pb-10 space-y-5">
            {error && (
              <div className="bg-rose-50 border border-rose-100 p-4 rounded-2xl flex items-start gap-3 animate-shake">
                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                <p className="text-[10px] font-bold text-rose-600 leading-tight">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="email" 
                  placeholder="Email professionnel" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                  required
                />
              </div>
              <div className="relative group">
                <LockIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={18} />
                <input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 text-white p-5 rounded-2xl font-black uppercase text-[12px] tracking-widest hover:bg-blue-600 transition-all flex justify-center items-center gap-3 shadow-xl disabled:opacity-50 active:scale-95 transition-transform"
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : "Se connecter"}
            </button>

            <div className="pt-6 text-center border-t border-slate-50">
              <Link 
                href="/signup"
                className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
              >
                Pas encore de compte ? S&apos;inscrire
              </Link>
            </div>
          </form>
        </div>
        <p className="text-center mt-8 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
          <ShieldAlert size={12} /> Infrastructure Sécurisée Supabase Auth
        </p>
      </div>
    </div>
  );
}

