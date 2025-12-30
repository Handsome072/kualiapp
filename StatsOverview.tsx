
import React from 'react';
import { AlertTriangle, History, Zap, CheckCircle2 } from 'lucide-react';
import { ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts';

interface StatsOverviewProps {
  readiness: number;
  ncCount: number;
  alertsCount: number;
  docsCount: number;
}

const StatCard: React.FC<{ 
  label: string; 
  value: string | number; 
  icon: React.ReactNode; 
  colorClass: string;
  sublabel?: string;
  special?: React.ReactNode;
}> = ({ label, value, icon, colorClass, sublabel, special }) => (
  <div className={`bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all flex flex-col justify-between min-h-[160px] group`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-widest mb-1">{label}</p>
        <h3 className={`text-4xl font-black ${colorClass}`}>{value}</h3>
      </div>
      <div className={`p-2 rounded-xl bg-slate-50 text-slate-400 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
    </div>
    <div className="mt-4">
      {special || (
        <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-wider text-slate-500">
          {sublabel}
        </div>
      )}
    </div>
  </div>
);

export const StatsOverview: React.FC<StatsOverviewProps> = ({ readiness, ncCount, alertsCount, docsCount }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/20 flex flex-col justify-between min-h-[160px]">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] uppercase font-black opacity-60 tracking-widest mb-1">Prêt pour l'Audit</p>
            <h3 className="text-5xl font-black">{readiness}%</h3>
          </div>
          <div className="w-12 h-12 relative">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={6} data={[{ value: readiness, fill: '#fff' }]} startAngle={90} endAngle={90 + (3.6 * readiness)}>
                <RadialBar dataKey="value" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center opacity-40">
              <CheckCircle2 size={14} />
            </div>
          </div>
        </div>
        <div className="text-[10px] bg-white/20 px-3 py-1.5 rounded-full inline-block font-black uppercase tracking-wider backdrop-blur-sm self-start">
          Audit Blanc Global
        </div>
      </div>

      <StatCard 
        label="NC Ouvertes" 
        value={ncCount} 
        icon={<AlertTriangle size={20} />} 
        colorClass="text-red-600"
        sublabel="Priorité Haute"
        special={<div className="flex items-center gap-2 text-[11px] text-red-500 font-black uppercase tracking-wider"><AlertTriangle size={14} /> Écarts à corriger</div>}
      />

      <StatCard 
        label="Alertes Veille" 
        value={alertsCount} 
        icon={<Zap size={20} />} 
        colorClass="text-orange-600"
        sublabel="Actualités RNQ"
        special={<div className="flex items-center gap-2 text-[11px] text-orange-500 font-black uppercase tracking-wider"><Zap size={14} /> Mises à jour</div>}
      />

      <StatCard 
        label="Dossiers Preuves" 
        value={docsCount} 
        icon={<History size={20} />} 
        colorClass="text-slate-900"
        sublabel="Archivage Central"
        special={<div className="flex items-center gap-2 text-[11px] text-slate-500 font-black uppercase tracking-wider"><History size={14} /> Historique</div>}
      />
    </div>
  );
};
