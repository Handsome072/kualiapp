
import React from 'react';
import { ShieldCheck, Info, Lock } from 'lucide-react';

export const PrivacyNotice: React.FC = () => {
  return (
    <div className="bg-blue-50/50 border border-blue-100 rounded-3xl p-6 mb-8">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-100 text-blue-600 rounded-xl shrink-0">
          <ShieldCheck size={20} />
        </div>
        <div className="space-y-2">
          <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest">Protection des données (RGPD)</h4>
          <p className="text-xs text-blue-700 leading-relaxed font-medium">
            Vos documents sont analysés par un moteur d'Intelligence Artificielle. 
            <strong> QualiApps applique automatiquement une anonymisation locale</strong> sur vos documents (noms, emails, téléphones) 
            avant traitement. Aucune donnée n'est utilisée pour l'entraînement des modèles publics.
          </p>
          <div className="flex items-center gap-4 pt-2">
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500">
              <Lock size={10} /> Chiffrement AES-256
            </span>
            <span className="flex items-center gap-1 text-[9px] font-black uppercase text-blue-500">
              <Info size={10} /> Conservation : Durée de l'audit
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
