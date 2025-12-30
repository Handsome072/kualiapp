
import React from 'react';
import { ClipboardList, ChevronRight, Clock, AlertCircle } from 'lucide-react';
import { NonConformity } from './types';

interface UpcomingTasksProps {
  ncList: NonConformity[];
  onNavigateToNC: () => void;
}

export const UpcomingTasks: React.FC<UpcomingTasksProps> = ({ ncList, onNavigateToNC }) => {
  const openTasks = ncList.filter(nc => nc.status !== 'Closed').slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full">
      <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
            <ClipboardList size={20} />
          </div>
          <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Actions Prioritaires</h4>
        </div>
        <button 
          onClick={onNavigateToNC}
          className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
        >
          Voir tout
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto divide-y divide-slate-50">
        {openTasks.length > 0 ? (
          openTasks.map(task => (
            <div key={task.id} className="p-6 hover:bg-slate-50 transition-colors group cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <span className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest ${
                  task.type === 'Majeure' ? 'bg-rose-100 text-rose-700' : 'bg-orange-100 text-orange-700'
                }`}>
                  NC {task.type} • I{task.indicatorId}
                </span>
                <span className="text-[9px] text-slate-400 flex items-center gap-1 font-bold">
                  <Clock size={10} /> {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium line-clamp-2 leading-relaxed">
                {task.description}
              </p>
              <div className="mt-3 flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Traiter l'écart</span>
                <ChevronRight size={14} />
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center p-8">
            <div className="w-12 h-12 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-3">
              <AlertCircle size={24} />
            </div>
            <p className="text-sm text-slate-400 font-medium italic text-center">
              Aucune action urgente détectée. Votre conformité est maîtrisée.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
