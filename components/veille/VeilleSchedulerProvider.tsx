'use client';

/**
 * VeilleSchedulerProvider
 * 
 * Composant wrapper qui gère le scheduler de veille automatique
 * À placer dans le layout ou la page principale
 */

import React, { createContext, useContext, ReactNode } from 'react';
import { useVeilleScheduler } from '../../hooks/useVeilleScheduler';

interface SchedulerStatus {
  isRunning: boolean;
  lastFetch: Date | null;
  lastAlerts: Date | null;
  lastEmails: Date | null;
  errors: string[];
}

interface VeilleSchedulerContextValue {
  status: SchedulerStatus;
  triggerFetch: () => Promise<void>;
  triggerAlerts: () => Promise<void>;
  triggerEmails: () => Promise<void>;
  triggerAll: () => Promise<void>;
}

const VeilleSchedulerContext = createContext<VeilleSchedulerContextValue | null>(null);

interface VeilleSchedulerProviderProps {
  children: ReactNode;
  enabled?: boolean;
  fetchIntervalMinutes?: number;
  alertsIntervalMinutes?: number;
  emailsIntervalMinutes?: number;
}

export function VeilleSchedulerProvider({
  children,
  enabled = true,
  fetchIntervalMinutes = 30,
  alertsIntervalMinutes = 5,
  emailsIntervalMinutes = 1
}: VeilleSchedulerProviderProps) {
  const scheduler = useVeilleScheduler({
    enabled,
    fetchInterval: fetchIntervalMinutes,
    alertsInterval: alertsIntervalMinutes,
    emailsInterval: emailsIntervalMinutes
  });

  return (
    <VeilleSchedulerContext.Provider value={scheduler}>
      {children}
    </VeilleSchedulerContext.Provider>
  );
}

export function useVeilleSchedulerContext(): VeilleSchedulerContextValue {
  const context = useContext(VeilleSchedulerContext);
  if (!context) {
    throw new Error('useVeilleSchedulerContext doit être utilisé dans VeilleSchedulerProvider');
  }
  return context;
}

// Composant optionnel pour afficher le statut du scheduler
export function VeilleSchedulerStatus() {
  const { status, triggerAll } = useVeilleSchedulerContext();

  const formatTime = (date: Date | null) => {
    if (!date) return 'Jamais';
    return date.toLocaleTimeString('fr-FR');
  };

  return (
    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-bold text-slate-800">Scheduler Veille</h4>
        <button
          onClick={triggerAll}
          disabled={status.isRunning}
          className="px-3 py-1 bg-orange-500 text-white rounded-lg text-xs font-bold hover:bg-orange-600 disabled:opacity-50"
        >
          {status.isRunning ? 'En cours...' : 'Exécuter maintenant'}
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-slate-400">Dernière collecte:</span>
          <p className="font-mono text-slate-600">{formatTime(status.lastFetch)}</p>
        </div>
        <div>
          <span className="text-slate-400">Dernières alertes:</span>
          <p className="font-mono text-slate-600">{formatTime(status.lastAlerts)}</p>
        </div>
        <div>
          <span className="text-slate-400">Derniers emails:</span>
          <p className="font-mono text-slate-600">{formatTime(status.lastEmails)}</p>
        </div>
      </div>

      {status.errors.length > 0 && (
        <div className="mt-3 p-2 bg-red-50 rounded-lg">
          <p className="text-red-600 text-xs font-bold mb-1">Erreurs récentes:</p>
          {status.errors.slice(-3).map((error, i) => (
            <p key={i} className="text-red-500 text-xs">{error}</p>
          ))}
        </div>
      )}
    </div>
  );
}

