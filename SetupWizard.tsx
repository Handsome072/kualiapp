'use client';

import React, { useState } from 'react';
import {
  User, Building2, Scale, ShieldCheck,
  ArrowRight, ArrowLeft, CheckCircle2,
  Info
} from 'lucide-react';
import { AppSettings, OrganismType } from './types';

// Paramètres par défaut pour garantir la structure complète
const DEFAULT_SETTINGS: AppSettings = {
  account: {
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    role: 'Responsable Qualité',
    position: '',
  },
  audit: {
    status: 'Non démarré',
    nextAuditDate: '',
    type: 'Initial',
  },
  typology: {
    organismType: 'OF' as OrganismType,
    isCertifying: false,
    isNonCertifying: true,
    hasAFEST: false,
    isAlternance: false,
    hasHandicapReferent: false,
    acceptsHandicap: true,
    usesSubcontractors: false,
    hasLMS: false,
    isSubcontractorOnly: false,
    hasPrerequisites: false,
    isShortFormat: false,
    noSubcontracting: false,
    hasWorkPeriods: false,
    isCFA: false,
  },
  stats: {
    activeFormationsCount: 0,
    internalFormersCount: 0,
    externalFormersCount: 0,
    hasQualityManager: true,
  },
  legal: {
    siret: '',
    tva: '',
    nda: '',
    address: '',
  },
  contacts: {
    pedagogic: { firstName: '', lastName: '', email: '' },
    commercial: { firstName: '', lastName: '', email: '' },
    dpo: { firstName: '', lastName: '', email: '' },
  },
  additionalUsers: [],
  setupComplete: false,
};

/**
 * Fusionne les paramètres reçus avec les valeurs par défaut
 * pour garantir que toutes les propriétés sont définies
 */
function mergeWithDefaults(settings: Partial<AppSettings> | null | undefined): AppSettings {
  if (!settings) return { ...DEFAULT_SETTINGS };

  return {
    account: { ...DEFAULT_SETTINGS.account, ...settings.account },
    audit: { ...DEFAULT_SETTINGS.audit, ...settings.audit },
    typology: { ...DEFAULT_SETTINGS.typology, ...settings.typology },
    stats: { ...DEFAULT_SETTINGS.stats, ...settings.stats },
    legal: { ...DEFAULT_SETTINGS.legal, ...settings.legal },
    contacts: {
      pedagogic: { ...DEFAULT_SETTINGS.contacts.pedagogic, ...settings.contacts?.pedagogic },
      commercial: { ...DEFAULT_SETTINGS.contacts.commercial, ...settings.contacts?.commercial },
      dpo: { ...DEFAULT_SETTINGS.contacts.dpo, ...settings.contacts?.dpo },
    },
    additionalUsers: settings.additionalUsers || [],
    setupComplete: settings.setupComplete || false,
  };
}

interface SetupWizardProps {
  settings: AppSettings;
  onComplete: (settings: AppSettings) => void;
}

export const SetupWizard: React.FC<SetupWizardProps> = ({ settings, onComplete }) => {
  const [step, setStep] = useState(1);
  // Toujours fusionner avec les valeurs par défaut pour éviter undefined
  const [localSettings, setLocalSettings] = useState<AppSettings>(() => mergeWithDefaults(settings));

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleFinish = () => {
    onComplete({ ...localSettings, setupComplete: true });
  };

  const updateAccount = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      account: { ...prev.account, [field]: value }
    }));
  };

  const updateLegal = (field: string, value: string) => {
    setLocalSettings(prev => ({
      ...prev,
      legal: { ...prev.legal, [field]: value }
    }));
  };

  const updateTypology = (field: keyof AppSettings['typology'], value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      typology: { ...prev.typology, [field]: value }
    }));
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 ml-1";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-slate-100 via-white to-slate-50">
      <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-2xl shadow-slate-200/50 overflow-hidden border border-white">
        
        {/* Progress Bar */}
        <div className="h-2 bg-slate-100 flex">
          {[1, 2, 3, 4].map(i => (
            <div 
              key={i} 
              className={`flex-1 transition-all duration-700 ${i <= step ? 'bg-blue-600' : 'bg-slate-100'}`} 
            />
          ))}
        </div>

        <div className="p-12">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <User size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Commençons par <span className="text-blue-600">vous</span></h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Identifiez l'administrateur qualité de la plateforme.</p>
              </header>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Prénom</label>
                  <input type="text" value={localSettings.account.firstName} onChange={e => updateAccount('firstName', e.target.value)} className={inputClass} placeholder="Ex: Jean" />
                </div>
                <div>
                  <label className={labelClass}>Nom</label>
                  <input type="text" value={localSettings.account.lastName} onChange={e => updateAccount('lastName', e.target.value)} className={inputClass} placeholder="Ex: Dupont" />
                </div>
              </div>
              <div>
                <label className={labelClass}>Nom de l'organisme (Enseigne)</label>
                <input type="text" value={localSettings.account.companyName} onChange={e => updateAccount('companyName', e.target.value)} className={inputClass} placeholder="Ex: Excellence Formation" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="text-center">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Scale size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Périmètre <span className="text-orange-600">Qualiopi</span></h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Quels types de prestations délivrez-vous ?</p>
              </header>

              <div className="grid grid-cols-2 gap-3">
                {(['OF', 'CFA', 'CBC', 'VAE'] as OrganismType[]).map(type => (
                  <button
                    key={type}
                    onClick={() => updateTypology('organismType', type)}
                    className={`p-6 rounded-[32px] border-2 transition-all text-left group ${
                      localSettings.typology.organismType === type 
                      ? 'border-orange-500 bg-orange-50/30' 
                      : 'border-slate-100 hover:border-orange-200'
                    }`}
                  >
                    <div className="font-black text-xl mb-1 text-slate-900">{type}</div>
                    <div className="text-[10px] uppercase font-black tracking-widest text-slate-400 group-hover:text-orange-500">
                      {type === 'OF' && "Formation Continue"}
                      {type === 'CFA' && "Apprentissage"}
                      {type === 'CBC' && "Bilan de Compétences"}
                      {type === 'VAE' && "Validation d'Acquis"}
                    </div>
                  </button>
                ))}
              </div>

              <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                <div className="flex items-start gap-4">
                  <Info className="text-slate-300 mt-1 shrink-0" size={20} />
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                    Ce choix est crucial : il définit quels indicateurs du Référentiel National Qualité (RNQ) seront audités par l'IA. Vous pourrez modifier ces réglages plus tard.
                  </p>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <header className="text-center">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <Building2 size={32} />
                </div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Données <span className="text-emerald-600">Légales</span></h2>
                <p className="text-slate-400 text-sm mt-2 font-medium">Ces informations sont nécessaires pour vos rapports d'audit.</p>
              </header>

              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Numéro SIRET</label>
                  <input type="text" value={localSettings.legal.siret} onChange={e => updateLegal('siret', e.target.value)} className={inputClass} placeholder="14 chiffres" />
                </div>
                <div>
                  <label className={labelClass}>Numéro de Déclaration d'Activité (NDA)</label>
                  <input type="text" value={localSettings.legal.nda} onChange={e => updateLegal('nda', e.target.value)} className={inputClass} placeholder="Ex: 11 75 12345 75" />
                </div>
                <div>
                  <label className={labelClass}>Adresse du siège</label>
                  <textarea value={localSettings.legal.address} onChange={e => updateLegal('address', e.target.value)} className={inputClass + " h-24 resize-none pt-4"} placeholder="Rue, CP, Ville" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-blue-600 text-white rounded-[40px] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/40 rotate-12">
                <ShieldCheck size={48} />
              </div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">Configuration <span className="text-blue-600">Terminée !</span></h2>
              <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                Votre environnement de conformité est prêt. Vous pouvez maintenant commencer à analyser vos premières preuves documentaires.
              </p>
              
              <div className="pt-8 grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-5 rounded-3xl text-left border border-slate-100">
                  <CheckCircle2 className="text-blue-500 mb-2" size={20} />
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Périmètre</div>
                  <div className="text-sm font-bold text-slate-800">{localSettings.typology.organismType}</div>
                </div>
                <div className="bg-slate-50 p-5 rounded-3xl text-left border border-slate-100">
                  <CheckCircle2 className="text-blue-500 mb-2" size={20} />
                  <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin</div>
                  <div className="text-sm font-bold text-slate-800 truncate">{localSettings.account.firstName} {localSettings.account.lastName}</div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-12 flex items-center justify-between gap-4">
            {step > 1 && step < 4 && (
              <button onClick={prevStep} className="flex items-center gap-2 px-8 py-4 rounded-2xl text-slate-400 font-black uppercase text-[11px] tracking-widest hover:bg-slate-50 transition-all">
                <ArrowLeft size={16} /> Précédent
              </button>
            )}
            
            {step < 4 ? (
              <button 
                onClick={nextStep} 
                className="ml-auto flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[11px] tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-slate-200"
              >
                Suivant <ArrowRight size={18} />
              </button>
            ) : (
              <button 
                onClick={handleFinish}
                className="w-full flex items-center justify-center gap-3 px-10 py-6 bg-blue-600 text-white rounded-[32px] font-black uppercase text-[12px] tracking-[0.2em] hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/30 active:scale-95"
              >
                Entrer dans QualiApps
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
