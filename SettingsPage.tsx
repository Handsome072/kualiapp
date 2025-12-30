'use client';

import React, { useState } from 'react';
import {
  User,
  Building2,
  Scale,
  Contact2,
  CalendarDays,
  Info,
  Plus,
  Trash2,
  Mail,
  Users,
  Bell,
  Settings
} from 'lucide-react';
import { AppSettings, AuditType, ContactInfo } from './types';
import { VeilleSettings } from './components/veille/VeilleSettings';

interface SettingsPageProps {
  settings: AppSettings;
  onUpdate: (settings: AppSettings) => void;
}

type SettingsTab = 'general' | 'veille';

export const SettingsPage: React.FC<SettingsPageProps> = ({ settings, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');

  const updateAccount = (field: keyof AppSettings['account'], value: string) => {
    onUpdate({ ...settings, account: { ...settings.account, [field]: value } });
  };

  const updateAudit = (field: keyof AppSettings['audit'], value: string) => {
    onUpdate({ ...settings, audit: { ...settings.audit, [field]: value } });
  };

  const updateTypology = (field: keyof AppSettings['typology'], value: boolean) => {
    onUpdate({ ...settings, typology: { ...settings.typology, [field]: value } });
  };

  const updateLegal = (field: keyof AppSettings['legal'], value: string) => {
    onUpdate({ ...settings, legal: { ...settings.legal, [field]: value } });
  };

  const updateContact = (contactKey: keyof AppSettings['contacts'], field: keyof ContactInfo, value: string) => {
    onUpdate({ 
      ...settings, 
      contacts: { 
        ...settings.contacts, 
        [contactKey]: { ...settings.contacts[contactKey], [field]: value } 
      } 
    });
  };

  const addAdditionalUser = () => {
    const newUser: ContactInfo = { firstName: '', lastName: '', email: '' };
    onUpdate({ ...settings, additionalUsers: [...(settings.additionalUsers || []), newUser] });
  };

  const updateAdditionalUser = (index: number, field: keyof ContactInfo, value: string) => {
    const updatedUsers = [...settings.additionalUsers];
    updatedUsers[index] = { ...updatedUsers[index], [field]: value };
    onUpdate({ ...settings, additionalUsers: updatedUsers });
  };

  const removeAdditionalUser = (index: number) => {
    const updatedUsers = settings.additionalUsers.filter((_, i) => i !== index);
    onUpdate({ ...settings, additionalUsers: updatedUsers });
  };

  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";
  const labelClass = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1";

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
          Gérez votre profil, vos obligations légales et le <span className="text-blue-600">périmètre de votre certification.</span>
        </h1>
        <p className="text-slate-500 text-sm font-medium mt-1">Configurez les paramètres globaux de votre organisme de formation.</p>
      </header>

      {/* Tabs de navigation */}
      <div className="flex gap-2 border-b border-slate-200 pb-4">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'general'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Settings size={18} /> Paramètres généraux
        </button>
        <button
          onClick={() => setActiveTab('veille')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'veille'
              ? 'bg-orange-500 text-white shadow-lg shadow-orange-200'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <Bell size={18} /> Alertes & Veille
        </button>
      </div>

      {/* Contenu Veille */}
      {activeTab === 'veille' && (
        <div className="animate-in fade-in duration-300">
          <VeilleSettings />
        </div>
      )}

      {/* Contenu Général */}
      {activeTab === 'general' && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Compte & Utilisateur */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><User size={20} /></div>
            <h2 className="font-bold text-slate-800">Profil Administrateur</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Prénom</label>
              <input type="text" value={settings.account.firstName} onChange={e => updateAccount('firstName', e.target.value)} className={inputClass} placeholder="Jean" />
            </div>
            <div>
              <label className={labelClass}>Nom</label>
              <input type="text" value={settings.account.lastName} onChange={e => updateAccount('lastName', e.target.value)} className={inputClass} placeholder="Dupont" />
            </div>
          </div>
          <div>
            <label className={labelClass}>Poste / Fonction</label>
            <input type="text" value={settings.account.position} onChange={e => updateAccount('position', e.target.value)} className={inputClass} placeholder="Responsable Qualité" />
          </div>
          <div>
            <label className={labelClass}>Adresse Email Pro</label>
            <input type="email" value={settings.account.email} onChange={e => updateAccount('email', e.target.value)} className={inputClass} placeholder="jean.dupont@organisme.fr" />
          </div>
        </section>

        {/* Audit Settings */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl"><CalendarDays size={20} /></div>
            <h2 className="font-bold text-slate-800">Planification d'Audit</h2>
          </div>
          <div>
            <label className={labelClass}>Date du prochain audit</label>
            <input type="date" value={settings.audit.nextAuditDate} onChange={e => updateAudit('nextAuditDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Type d'Audit prévu</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Initial', 'Surveillance', 'Renouvellement'] as AuditType[]).map(type => (
                <button
                  key={type}
                  onClick={() => updateAudit('type', type)}
                  className={`py-2 text-[10px] font-black uppercase rounded-xl border transition-all ${
                    settings.audit.type === type 
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-100' 
                    : 'bg-white text-slate-400 border-slate-100 hover:border-indigo-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-blue-50 p-4 rounded-2xl flex gap-3 text-[11px] text-blue-700 leading-relaxed font-medium">
            <Info size={18} className="shrink-0 text-blue-400" />
            La date d'audit permet à QualiApps de prioriser vos actions de mise en conformité.
          </div>
        </section>

        {/* Contacts Référents */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Contact2 size={20} /></div>
            <h2 className="font-bold text-slate-800">Contacts Référents (Obligatoires Qualiopi)</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ContactFields 
              title="Référent Pédagogique" 
              contact={settings.contacts.pedagogic} 
              onUpdate={(f, v) => updateContact('pedagogic', f, v)} 
            />
            <ContactFields 
              title="Référent Commercial" 
              contact={settings.contacts.commercial} 
              onUpdate={(f, v) => updateContact('commercial', f, v)} 
            />
            <ContactFields 
              title="DPO (RGPD)" 
              contact={settings.contacts.dpo} 
              onUpdate={(f, v) => updateContact('dpo', f, v)} 
            />
          </div>
        </section>

        {/* Utilisateurs supplémentaires */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 text-purple-600 rounded-xl"><Users size={20} /></div>
              <h2 className="font-bold text-slate-800">Utilisateurs supplémentaires</h2>
            </div>
            <button 
              onClick={addAdditionalUser}
              className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-purple-700 shadow-lg shadow-purple-100"
            >
              <Plus size={16} /> Ajouter un utilisateur
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(settings.additionalUsers || []).map((user, index) => (
              <div key={index} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 relative group/user">
                <button 
                  onClick={() => removeAdditionalUser(index)}
                  className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/user:opacity-100"
                >
                  <Trash2 size={16} />
                </button>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Prénom</label>
                      <input 
                        type="text" 
                        value={user.firstName} 
                        onChange={e => updateAdditionalUser(index, 'firstName', e.target.value)} 
                        className={inputClass + " bg-white"} 
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Nom</label>
                      <input 
                        type="text" 
                        value={user.lastName} 
                        onChange={e => updateAdditionalUser(index, 'lastName', e.target.value)} 
                        className={inputClass + " bg-white"} 
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input 
                      type="email" 
                      value={user.email} 
                      onChange={e => updateAdditionalUser(index, 'email', e.target.value)} 
                      className={inputClass + " bg-white"} 
                    />
                  </div>
                </div>
              </div>
            ))}
            {(!settings.additionalUsers || settings.additionalUsers.length === 0) && (
              <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl">
                <p className="text-sm text-slate-400 font-medium italic">Aucun utilisateur supplémentaire configuré.</p>
              </div>
            )}
          </div>
        </section>

        {/* Typologie (Logique Qualiopi) */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-50 text-orange-600 rounded-xl"><Scale size={20} /></div>
            <h2 className="font-bold text-slate-800">Typologie & Applicabilité des Indicateurs</h2>
          </div>
          <p className="text-slate-400 text-xs font-medium -mt-2 mb-6 italic">Ces réglages modifient automatiquement le périmètre des 32 indicateurs du RNQ.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
            <TypologyToggle label="Uniquement sous-traitant" desc="Désactivation automatique des indicateurs 1, 2 et 3" active={settings.typology.isSubcontractorOnly} onToggle={v => updateTypology('isSubcontractorOnly', v)} />
            <TypologyToggle label="Formations avec prérequis" desc="Activation de l'indicateur 8" active={settings.typology.hasPrerequisites} onToggle={v => updateTypology('hasPrerequisites', v)} />
            <TypologyToggle label="Formations ≤ 2 jours" desc="Désactivation de l'indicateur 12" active={settings.typology.isShortFormat} onToggle={v => updateTypology('isShortFormat', v)} />
            <TypologyToggle label="Certification RNCP / RS" desc="Activation des indicateurs 3, 7 et 16" active={settings.typology.isCertifying} onToggle={v => updateTypology('isCertifying', v)} />
            <TypologyToggle label="Formation en alternance" desc="Activation de l'indicateur 13" active={settings.typology.isAlternance} onToggle={v => updateTypology('isAlternance', v)} />
            <TypologyToggle label="Aucune sous-traitance" desc="Désactivation de l'indicateur 27" active={settings.typology.noSubcontracting} onToggle={v => updateTypology('noSubcontracting', v)} />
            <TypologyToggle label="Périodes en entreprise / AFEST" desc="Activation de l'indicateur 28" active={settings.typology.hasWorkPeriods} onToggle={v => updateTypology('hasWorkPeriods', v)} />
            <TypologyToggle label="Organisme CFA" desc="Activation intégrale Qualiopi" active={settings.typology.isCFA} onToggle={v => updateTypology('isCFA', v)} isHighlight />
          </div>
        </section>

        {/* Infos Légales */}
        <section className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-slate-100 text-slate-600 rounded-xl"><Building2 size={20} /></div>
            <h2 className="font-bold text-slate-800">Informations Légales</h2>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>N° SIRET</label>
              <input type="text" value={settings.legal.siret} onChange={e => updateLegal('siret', e.target.value)} className={inputClass} placeholder="123 456 789 00012" />
            </div>
            <div>
              <label className={labelClass}>N° TVA Intracom.</label>
              <input type="text" value={settings.legal.tva} onChange={e => updateLegal('tva', e.target.value)} className={inputClass} placeholder="FR 12 345678901" />
            </div>
          </div>
          <div>
            <label className={labelClass}>N° NDA (Déclaration d'activité)</label>
            <input type="text" value={settings.legal.nda} onChange={e => updateLegal('nda', e.target.value)} className={inputClass} placeholder="11 75 12345 75" />
          </div>
          <div>
            <label className={labelClass}>Adresse complète</label>
            <textarea value={settings.legal.address} onChange={e => updateLegal('address', e.target.value)} className={inputClass + " h-24 resize-none"} />
          </div>
        </section>
      </div>
      )}
    </div>
  );
};

const ContactFields: React.FC<{ 
  title: string; 
  contact: ContactInfo; 
  onUpdate: (f: keyof ContactInfo, v: string) => void;
}> = ({ title, contact, onUpdate }) => {
  const inputClass = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all";
  const labelClass = "block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 ml-1";
  
  return (
    <div className="space-y-4 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
      <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-2 mb-2">
        <Mail size={12} className="text-blue-500" /> {title}
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Prénom</label>
          <input 
            type="text" 
            value={contact.firstName} 
            onChange={e => onUpdate('firstName', e.target.value)} 
            className={inputClass + " bg-white"} 
          />
        </div>
        <div>
          <label className={labelClass}>Nom</label>
          <input 
            type="text" 
            value={contact.lastName} 
            onChange={e => onUpdate('lastName', e.target.value)} 
            className={inputClass + " bg-white"} 
          />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input 
          type="email" 
          value={contact.email} 
          onChange={e => onUpdate('email', e.target.value)} 
          className={inputClass + " bg-white"} 
        />
      </div>
    </div>
  );
};

const TypologyToggle: React.FC<{ 
  label: string; 
  desc: string; 
  active: boolean; 
  onToggle: (v: boolean) => void;
  isHighlight?: boolean;
}> = ({ label, desc, active, onToggle, isHighlight }) => (
  <button 
    onClick={() => onToggle(!active)}
    className={`flex items-start gap-4 p-4 rounded-2xl border text-left transition-all group ${
      active 
      ? (isHighlight ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-100' : 'bg-blue-50 border-blue-200') 
      : 'bg-white border-slate-100 hover:border-slate-200'
    }`}
  >
    <div className={`mt-0.5 w-10 h-6 rounded-full relative transition-colors ${active ? (isHighlight ? 'bg-white/20' : 'bg-blue-500') : 'bg-slate-100'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full shadow-sm transition-all ${active ? 'left-5 bg-white' : 'left-1 bg-white'}`} />
    </div>
    <div>
      <div className={`text-xs font-black uppercase tracking-tight ${active && isHighlight ? 'text-white' : 'text-slate-800'}`}>{label}</div>
      <div className={`text-[10px] leading-snug mt-0.5 ${active && isHighlight ? 'text-indigo-100' : 'text-slate-400'}`}>{desc}</div>
    </div>
  </button>
);
