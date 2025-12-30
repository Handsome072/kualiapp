
import React from 'react';
import { OrganismType } from './types';

interface WelcomeSectionProps {
  organismType: OrganismType;
}

export const WelcomeSection: React.FC<WelcomeSectionProps> = ({ organismType }) => {
  const today = new Date().toLocaleDateString('fr-FR', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Tableau de bord <span className="text-blue-600">Qualité</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-wider text-[10px]">
            Organisme {organismType} • {today}
          </p>
        </div>
      </div>
    </div>
  );
};
