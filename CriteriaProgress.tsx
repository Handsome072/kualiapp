
import React from 'react';
import { QUALIOPI_CRITERIA } from './constants';
import { AuditState } from './types';
import { CheckCircle2 } from 'lucide-react';

interface CriteriaProgressProps {
  auditStates: AuditState[];
}

export const CriteriaProgress: React.FC<CriteriaProgressProps> = ({ auditStates }) => {
  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <h4 className="text-sm font-black text-slate-800 uppercase tracking-widest">Progression par Critère</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">État d'avancement des 7 piliers de la certification</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-8">
        {QUALIOPI_CRITERIA.map(c => {
          const indicators = c.indicators;
          const readyCount = auditStates.filter(s => indicators.includes(s.indicatorId) && s.status === 'Ready').length;
          const progress = Math.round((readyCount / indicators.length) * 100);
          
          return (
            <div key={c.id} className="space-y-3 group">
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest mb-1">Critère 0{c.id}</span>
                  <span className="text-[11px] font-bold text-slate-700 truncate max-w-[180px] group-hover:text-blue-600 transition-colors" title={c.title}>
                    {c.title}
                  </span>
                </div>
                <span className="text-[10px] font-black text-slate-900 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                  {progress}%
                </span>
              </div>
              <div className="relative pt-1">
                <div className="h-2 bg-slate-50 rounded-full overflow-hidden border border-slate-100/50">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(37,99,235,0.2)] ${
                      progress === 100 ? 'bg-green-500' : progress > 0 ? 'bg-blue-600' : 'bg-slate-200'
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
