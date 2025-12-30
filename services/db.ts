
import { supabase } from './supabase';
import { AppSettings, UserWorkspace, DocumentAnalysisReport, OrganismType } from "../types";

export const DEFAULT_SETTINGS: AppSettings = {
  account: {
    firstName: '',
    lastName: '',
    email: '',
    companyName: '',
    role: 'Responsable Qualité',
    position: '',
  },
  audit: {
    status: 'Non démarré',
    nextAuditDate: '',
    type: 'Initial',
  },
  typology: {
    organismType: 'OF' as OrganismType,
    isCertifying: false,
    isNonCertifying: true,
    hasAFEST: false,
    isAlternance: false,
    hasHandicapReferent: false,
    acceptsHandicap: true,
    usesSubcontractors: false,
    hasLMS: false,
    isSubcontractorOnly: false,
    hasPrerequisites: false,
    isShortFormat: false,
    noSubcontracting: false,
    hasWorkPeriods: false,
    isCFA: false,
  },
  stats: {
    activeFormationsCount: 0,
    internalFormersCount: 0,
    externalFormersCount: 0,
    hasQualityManager: true,
  },
  legal: {
    siret: '',
    tva: '',
    nda: '',
    address: '',
  },
  contacts: {
    pedagogic: { firstName: '', lastName: '', email: '' },
    commercial: { firstName: '', lastName: '', email: '' },
    dpo: { firstName: '', lastName: '', email: '' },
  },
  additionalUsers: [],
  setupComplete: false,
};

/**
 * Fusionne les paramètres partiels avec les valeurs par défaut
 * pour garantir que toutes les propriétés sont définies
 */
function mergeSettings(partial: any): AppSettings {
  if (!partial || typeof partial !== 'object') return { ...DEFAULT_SETTINGS };

  return {
    account: { ...DEFAULT_SETTINGS.account, ...partial.account },
    audit: { ...DEFAULT_SETTINGS.audit, ...partial.audit },
    typology: { ...DEFAULT_SETTINGS.typology, ...partial.typology },
    stats: { ...DEFAULT_SETTINGS.stats, ...partial.stats },
    legal: { ...DEFAULT_SETTINGS.legal, ...partial.legal },
    contacts: {
      pedagogic: { ...DEFAULT_SETTINGS.contacts.pedagogic, ...partial.contacts?.pedagogic },
      commercial: { ...DEFAULT_SETTINGS.contacts.commercial, ...partial.contacts?.commercial },
      dpo: { ...DEFAULT_SETTINGS.contacts.dpo, ...partial.contacts?.dpo },
    },
    additionalUsers: partial.additionalUsers || [],
    setupComplete: partial.setupComplete || false,
  };
}

export const db = {
  /**
   * Récupère le workspace complet d'un utilisateur
   * Utilise user_id pour les requêtes (nouvelle structure)
   */
  getWorkspace: async (userId: string): Promise<UserWorkspace | null> => {
    try {
      // Récupérer le profil avec user_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileError) throw new Error(profileError.message);

      let settings: AppSettings;

      // Création automatique du profil si inexistant
      if (!profile) {
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([{
            user_id: userId,
            settings: DEFAULT_SETTINGS
          }])
          .select()
          .single();

        if (insertError) throw new Error(insertError.message);
        settings = mergeSettings(newProfile.settings);
      } else {
        // Toujours fusionner avec les valeurs par défaut pour combler les propriétés manquantes
        settings = mergeSettings(profile.settings);
      }

      // Récupérer les données liées
      const [reportsRes, ncRes, docsRes, auditRes] = await Promise.all([
        supabase.from('reports').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('non_conformities').select('*').eq('user_id', userId),
        supabase.from('documents').select('*').eq('user_id', userId),
        supabase.from('audit_states').select('*').eq('user_id', userId)
      ]);

      return {
        settings,
        reports: (reportsRes.data?.map(r => ({ ...r.data, id: r.id, isVerified: r.verified_by_server })) || []) as DocumentAnalysisReport[],
        ncList: ncRes.data || [],
        docs: docsRes.data || [],
        auditStates: auditRes.data || []
      };
    } catch (error: any) {
      console.error("Erreur critique Workspace:", error?.message);
      throw error;
    }
  },

  /**
   * Met à jour les paramètres d'un utilisateur
   */
  updateSettings: async (userId: string, settings: AppSettings) => {
    const { error } = await supabase
      .from('profiles')
      .update({ settings })
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
  }
};
