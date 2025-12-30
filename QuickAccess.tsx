
import React from 'react';
import { Search, FileSearch, Target } from 'lucide-react';

interface QuickAccessProps {
  onAction: (page: string) => void;
}

export const QuickAccess: React.FC<QuickAccessProps> = ({ onAction }) => {
  const actions = [
    { id: 'analyzer', label: 'Nouvelle Analyse', icon: <FileSearch size={18} />, color: 'bg-blue-600 text-white shadow-blue-200' },
    { id: 'audit', label: 'Audit Blanc', icon: <Target size={18} />, color: 'bg-indigo-600 text-white shadow-indigo-200' },
    { id: 'reference', label: 'Référentiel RNQ', icon: <Search size={18} />, color: 'bg-white text-slate-700 border border-slate-200' },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {actions.map(action => (
        <button
          key={action.id}
          onClick={() => onAction(action.id)}
          className={`${action.color} px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-lg`}
        >
          {action.icon}
          {action.label}
        </button>
      ))}
    </div>
  );
};
