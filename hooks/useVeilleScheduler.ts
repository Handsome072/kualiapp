/**
 * Hook useVeilleScheduler
 * 
 * Gère les tâches programmées de veille côté client
 * - Collecte périodique des sources RSS/HTML
 * - Traitement des alertes
 * - Envoi des emails en queue
 */

import { useEffect, useRef, useCallback, useState } from 'react';

interface SchedulerConfig {
  enabled: boolean;
  fetchInterval: number;      // Intervalle de collecte en minutes (défaut: 30)
  alertsInterval: number;     // Intervalle de traitement alertes en minutes (défaut: 5)
  emailsInterval: number;     // Intervalle d'envoi emails en minutes (défaut: 1)
  apiSecret?: string;         // Secret pour authentifier les appels
}

interface SchedulerStatus {
  isRunning: boolean;
  lastFetch: Date | null;
  lastAlerts: Date | null;
  lastEmails: Date | null;
  errors: string[];
}

interface SchedulerResult {
  status: SchedulerStatus;
  triggerFetch: () => Promise<void>;
  triggerAlerts: () => Promise<void>;
  triggerEmails: () => Promise<void>;
  triggerAll: () => Promise<void>;
}

const DEFAULT_CONFIG: SchedulerConfig = {
  enabled: true,
  fetchInterval: 30,      // 30 minutes
  alertsInterval: 5,      // 5 minutes
  emailsInterval: 1,      // 1 minute
};

export function useVeilleScheduler(config: Partial<SchedulerConfig> = {}): SchedulerResult {
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };
  
  const [status, setStatus] = useState<SchedulerStatus>({
    isRunning: false,
    lastFetch: null,
    lastAlerts: null,
    lastEmails: null,
    errors: []
  });

  const fetchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const alertsIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const emailsIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const addError = useCallback((error: string) => {
    setStatus(prev => ({
      ...prev,
      errors: [...prev.errors.slice(-9), error] // Garder les 10 dernières erreurs
    }));
  }, []);

  const getHeaders = useCallback(() => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (mergedConfig.apiSecret) {
      headers['Authorization'] = `Bearer ${mergedConfig.apiSecret}`;
    }
    return headers;
  }, [mergedConfig.apiSecret]);

  // Collecter les sources
  const triggerFetch = useCallback(async () => {
    try {
      setStatus(prev => ({ ...prev, isRunning: true }));
      
      const response = await fetch('/api/veille/fetch-sources', {
        method: 'POST',
        headers: getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Fetch failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('📡 Veille fetch:', data);
      
      setStatus(prev => ({ 
        ...prev, 
        lastFetch: new Date(),
        isRunning: false 
      }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur fetch';
      addError(msg);
      setStatus(prev => ({ ...prev, isRunning: false }));
    }
  }, [getHeaders, addError]);

  // Traiter les alertes
  const triggerAlerts = useCallback(async () => {
    try {
      const response = await fetch('/api/veille/process-alerts', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ mode: 'immediate', since_hours: 1 })
      });

      if (!response.ok) {
        throw new Error(`Alerts failed: ${response.status}`);
      }

      const data = await response.json();
      console.log('🔔 Veille alerts:', data);
      
      setStatus(prev => ({ ...prev, lastAlerts: new Date() }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur alertes';
      addError(msg);
    }
  }, [getHeaders, addError]);

  // Envoyer les emails
  const triggerEmails = useCallback(async () => {
    try {
      const response = await fetch('/api/veille/send-emails', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ limit: 10 })
      });

      if (!response.ok) {
        throw new Error(`Emails failed: ${response.status}`);
      }

      const data = await response.json();
      if (data.sent > 0 || data.failed > 0) {
        console.log('📧 Veille emails:', data);
      }
      
      setStatus(prev => ({ ...prev, lastEmails: new Date() }));
    } catch (error) {
      const msg = error instanceof Error ? error.message : 'Erreur emails';
      addError(msg);
    }
  }, [getHeaders, addError]);

  // Déclencher toutes les tâches
  const triggerAll = useCallback(async () => {
    await triggerFetch();
    await triggerAlerts();
    await triggerEmails();
  }, [triggerFetch, triggerAlerts, triggerEmails]);

  // Configurer les intervalles
  useEffect(() => {
    if (!mergedConfig.enabled) return;

    // Fetch sources
    fetchIntervalRef.current = setInterval(
      triggerFetch,
      mergedConfig.fetchInterval * 60 * 1000
    );

    // Process alerts
    alertsIntervalRef.current = setInterval(
      triggerAlerts,
      mergedConfig.alertsInterval * 60 * 1000
    );

    // Send emails
    emailsIntervalRef.current = setInterval(
      triggerEmails,
      mergedConfig.emailsInterval * 60 * 1000
    );

    // Exécuter immédiatement au démarrage (après 5 secondes)
    const initialTimeout = setTimeout(() => {
      triggerFetch();
    }, 5000);

    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      if (alertsIntervalRef.current) clearInterval(alertsIntervalRef.current);
      if (emailsIntervalRef.current) clearInterval(emailsIntervalRef.current);
      clearTimeout(initialTimeout);
    };
  }, [mergedConfig.enabled, mergedConfig.fetchInterval, mergedConfig.alertsInterval, mergedConfig.emailsInterval, triggerFetch, triggerAlerts, triggerEmails]);

  return {
    status,
    triggerFetch,
    triggerAlerts,
    triggerEmails,
    triggerAll
  };
}

