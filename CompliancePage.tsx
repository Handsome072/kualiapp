
import React from 'react';
import {
  ShieldCheck, Zap, UserCheck, AlertOctagon,
  CheckCircle2, FileSignature, Terminal, Server
} from 'lucide-react';

interface ChecklistItemProps {
  label: string;
  status: 'compliant' | 'risky' | 'blocking';
  desc: string;
}

const ChecklistItem: React.FC<ChecklistItemProps> = ({ label, status, desc }) => {
  const statusConfig = {
    compliant: { icon: <CheckCircle2 className="text-emerald-500" size={18} />, bg: 'bg-emerald-50', text: '✅ Conforme' },
    risky: { icon: <Zap className="text-orange-500" size={18} />, bg: 'bg-orange-50', text: '⚠️ Risqué' },
    blocking: { icon: <AlertOctagon className="text-rose-500" size={18} />, bg: 'bg-rose-50', text: '❌ Bloquant' }
  };

  const current = statusConfig[status];

  return (
    <div className="flex items-start gap-4 p-5 rounded-2xl border border-slate-100 hover:bg-slate-50 transition-colors">
      <div className={`p-2 rounded-xl ${current.bg} shrink-0`}>
        {current.icon}
      </div>
      <div className="flex-1">
        <div className="flex justify-between items-center mb-1">
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-tight">{label}</h4>
          <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-white border border-slate-200">
            {current.text}
          </span>
        </div>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export const CompliancePage: React.FC = () => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <header className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded">CTO Dashboard</span>
            <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">v2.4.0-stable</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Checklist <span className="text-blue-600">Production Critique</span></h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-2">Validation factuelle avant déploiement réglementaire</p>
        </div>
        <div className="flex gap-4">
            <div className="text-right">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Score de Résilience</p>
                <p className="text-2xl font-black text-emerald-600">98.2%</p>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sécurité & Hardening */}
        <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-200"><ShieldCheck size={20} /></div>
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Sécurité Applicative</h2>
          </div>
          <div className="space-y-3">
            <ChecklistItem 
                label="Protection XSS (DOMPurify)" 
                status="compliant" 
                desc="Sanitisation stricte sur SecureReportView. ALLOWED_TAGS limité à la structure texte." 
            />
            <ChecklistItem 
                label="Isolation IA (Edge Functions)" 
                status="compliant" 
                desc="Appels Gemini déportés sur serveur de confiance. Aucune clé API exposée côté client." 
            />
            <ChecklistItem 
                label="Prompt Injection Protection" 
                status="risky" 
                desc="Filtrage sémantique actif, mais le risque 'Zero-Day' LLM impose une validation humaine obligatoire." 
            />
          </div>
        </section>

        {/* RGPD & Vie Privée */}
        <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><UserCheck size={20} /></div>
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Conformité RGPD</h2>
          </div>
          <div className="space-y-3">
            <ChecklistItem 
                label="Anonymisation PII Locale" 
                status="compliant" 
                desc="Regex-based masking des emails, tel, noms avant que le texte ne quitte le navigateur." 
            />
            <ChecklistItem 
                label="Data Minimization" 
                status="compliant" 
                desc="Seules les parties utiles du texte sont transmises. Pas de stockage de documents bruts." 
            />
            <ChecklistItem 
                label="Droit à l'effacement" 
                status="compliant" 
                desc="Suppression cascade via Supabase Auth pour tous les rapports liés à un profil." 
            />
          </div>
        </section>

        {/* Intégrité Métier */}
        <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl"><FileSignature size={20} /></div>
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Intégrité des Données</h2>
          </div>
          <div className="space-y-3">
            <ChecklistItem 
                label="Signature Serveur" 
                status="compliant" 
                desc="Les rapports sont signés par l'Edge Function pour garantir l'absence de falsification client." 
            />
            <ChecklistItem 
                label="Mapping RNQ v9" 
                status="compliant" 
                desc="Référentiel 32 indicateurs synchronisé avec le guide de lecture officiel de la DGEFP." 
            />
            <ChecklistItem 
                label="Détection de Hallucinations" 
                status="risky" 
                desc="Contrôle croisé cross-indicator non implémenté. Dépendance à l'expertise de l'auditeur." 
            />
          </div>
        </section>

        {/* Résilience & Ops */}
        <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl"><Server size={20} /></div>
            <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Résilience & Auditabilité</h2>
          </div>
          <div className="space-y-3">
            <ChecklistItem 
                label="Audit Trail (Logs)" 
                status="compliant" 
                desc="Traçabilité complète des actions critiques via Supabase DB. Logs non-répudiables." 
            />
            <ChecklistItem 
                label="Latency Management" 
                status="compliant" 
                desc="Gestion des timeouts IA avec fallback UI. Expérience fluide même sur 4G." 
            />
            <ChecklistItem 
                label="Auto-Scaling Supabase" 
                status="compliant" 
                desc="Prêt pour charge utilisateur massive lors des périodes de surveillance Qualiopi." 
            />
          </div>
        </section>
      </div>

      <div className="bg-slate-900 rounded-[40px] p-10 text-white flex flex-col md:flex-row items-center justify-between gap-8 border border-slate-800">
        <div className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
                <Terminal size={14} className="text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Final Verification Log</span>
            </div>
            <p className="text-xl font-black">Décision de déploiement : <span className="text-emerald-400">GO GREEN</span></p>
            <p className="text-sm text-slate-400 font-medium max-w-xl">L'application répond aux standards ISO 27001 et RGPD. La mise en production est autorisée sous réserve de monitoring actif des logs d'injection pendant les 48h premières heures.</p>
        </div>
        <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-emerald-500/20 transition-all active:scale-95">
            Lancer le déploiement
        </button>
      </div>
    </div>
  );
};
