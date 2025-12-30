'use client';

import React, { useState, useRef, useMemo } from 'react';
import {
  Upload, AlertTriangle, Info, ChevronRight, ArrowLeft,
  RefreshCw, Clock, ShieldCheck, Lock
} from 'lucide-react';
import { QUALIOPI_CRITERIA, QUALIOPI_INDICATORS } from './constants';
import { DocumentAnalysisReport, ConformityStatus } from './types';
import { SecureReportView } from './components/SecureReportView';
import { PrivacyNotice } from './components/PrivacyNotice';

interface ReferencePageProps {
  reports: DocumentAnalysisReport[];
  isAnalyzing: boolean;
  onAnalyze: (content: string, indicatorId: number) => void;
}

export const ReferencePage: React.FC<ReferencePageProps> = ({ reports, isAnalyzing, onAnalyze }) => {
  const [selectedIndicatorId, setSelectedIndicatorId] = useState<number | null>(null);
  const [activeReportId, setActiveReportId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedIndicator = useMemo(() => 
    QUALIOPI_INDICATORS.find(i => i.id === selectedIndicatorId), 
    [selectedIndicatorId]
  );

  const indicatorHistory = useMemo(() => {
    if (!selectedIndicatorId) return [];
    return reports
      .filter(r => r.results.some(res => res.indicatorId === selectedIndicatorId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [reports, selectedIndicatorId]);

  const displayedAnalysis = useMemo(() => {
    if (!selectedIndicatorId) return null;
    const report = activeReportId 
      ? reports.find(r => r.id === activeReportId)
      : indicatorHistory[0];
    
    return {
      result: report?.results.find(res => res.indicatorId === selectedIndicatorId),
      isVerified: (report as any)?.isVerified || false
    };
  }, [selectedIndicatorId, activeReportId, reports, indicatorHistory]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedIndicatorId) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          onAnalyze(event.target.result, selectedIndicatorId);
          setActiveReportId(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case ConformityStatus.COMPLIANT: return 'text-green-500 bg-green-50 border-green-100';
      case ConformityStatus.MINOR_NON_CONFORMITY: return 'text-orange-500 bg-orange-50 border-orange-100';
      case ConformityStatus.MAJOR_NON_CONFORMITY: return 'text-red-500 bg-red-50 border-red-100';
      default: return 'text-slate-400 bg-slate-50 border-slate-100';
    }
  };

  if (!selectedIndicatorId) {
    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <header className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Référentiel <span className="text-blue-600">Qualiopi Sécurisé</span></h1>
            <p className="text-slate-500 text-sm font-medium mt-1 uppercase tracking-widest text-[10px]">Protection de l'intégrité par calcul distribué</p>
          </div>
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-2xl border border-emerald-100">
            <Lock size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">RLS Active</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {QUALIOPI_CRITERIA.map(c => (
            <div key={c.id} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center text-xs font-black shadow-lg">0{c.id}</div>
                <h3 className="font-bold text-slate-800 text-sm tracking-tight">{c.title}</h3>
              </div>
              <div className="space-y-2">
                {QUALIOPI_INDICATORS.filter(ind => c.indicators.includes(ind.id)).map(ind => (
                  <button 
                    key={ind.id} 
                    onClick={() => setSelectedIndicatorId(ind.id)}
                    className="w-full bg-white p-5 rounded-2xl border border-slate-100 text-left hover:border-blue-300 hover:shadow-xl hover:-translate-y-1 transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest group-hover:text-blue-500">Indicateur {ind.id}</span>
                      <ChevronRight size={14} className="text-slate-200 group-hover:text-blue-500" />
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-1.5 line-clamp-2">{ind.label}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in slide-in-from-right duration-500 pb-20">
      <button onClick={() => { setSelectedIndicatorId(null); }} className="flex items-center gap-2 text-slate-400 hover:text-blue-600 transition-colors text-xs font-black uppercase tracking-widest">
        <ArrowLeft size={16} /> Retour au référentiel
      </button>

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none">Indicateur <span className="text-blue-600">{selectedIndicatorId}</span></h1>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest mt-3 max-w-2xl">{selectedIndicator?.label}</p>
        </div>
      </div>

      <PrivacyNotice />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-10">
          <section className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl"><Info size={20} /></div>
              <h2 className="font-black text-slate-800 uppercase tracking-widest text-xs">Analyse de Preuve</h2>
            </div>
            
            <div 
              onClick={() => !isAnalyzing && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-200 rounded-3xl p-12 flex flex-col items-center justify-center hover:bg-slate-50 transition-all cursor-pointer ${isAnalyzing ? 'opacity-50 cursor-wait' : ''}`}
            >
              <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
              {isAnalyzing ? (
                <div className="flex flex-col items-center gap-4">
                  <RefreshCw className="animate-spin text-blue-500" size={32} />
                  <span className="text-xs font-black text-blue-400 uppercase tracking-widest">Analyse sécurisée RGPD...</span>
                </div>
              ) : (
                <div className="text-center">
                  <Upload size={32} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-900 font-black text-sm uppercase tracking-widest">Importer une preuve</p>
                </div>
              )}
            </div>
          </section>

          {displayedAnalysis?.result && (
            <section className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-sm space-y-8">
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    {displayedAnalysis.isVerified ? <ShieldCheck size={24} /> : <AlertTriangle size={24} />}
                  </div>
                  <div>
                    <h2 className="font-black text-slate-800 uppercase tracking-widest text-sm">Rapport d'Audit IA</h2>
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1 mt-1">
                      <Lock size={10} /> Données anonymisées transmises
                    </span>
                  </div>
                </div>
                <div className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border-2 ${getStatusColor(displayedAnalysis.result.status)}`}>
                  {displayedAnalysis.result.status}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Justification de l'auditeur</h4>
                <div className="text-sm text-slate-700 leading-relaxed font-medium bg-slate-50 p-6 rounded-2xl">
                  <SecureReportView content={displayedAnalysis.result.justification} />
                </div>
              </div>
            </section>
          )}
        </div>

        <div className="lg:col-span-4">
          <section className="bg-slate-900 rounded-[32px] p-8 border border-slate-800 text-white space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-400">Piste d'audit</h3>
            <div className="space-y-4">
              {indicatorHistory.map(report => (
                <div key={report.id} className="flex gap-4 items-start border-l border-slate-800 pl-4 pb-4 cursor-pointer hover:bg-slate-800/50 p-2 rounded-lg transition-colors" onClick={() => setActiveReportId(report.id)}>
                  <div className="mt-1"><Clock size={12} className="text-slate-500" /></div>
                  <div>
                    <p className="text-[10px] font-black uppercase">{new Date(report.timestamp).toLocaleDateString()}</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase truncate max-w-[150px]">{report.documentName}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
