
export enum ConformityStatus {
  COMPLIANT = 'Conforme',
  MINOR_NON_CONFORMITY = 'Non-conformité mineure',
  MAJOR_NON_CONFORMITY = 'Non-conformité majeure',
  NOT_APPLICABLE = 'Non applicable'
}

export type OrganismType = 'OF' | 'CFA' | 'CBC' | 'VAE';

export interface DocumentAnalysisReport {
  id: string;
  timestamp: string;
  documentName: string;
  overallScore: number;
  results: AnalysisResult[];
  organismType?: OrganismType;
  isVerified?: boolean; // Indique si le rapport a été généré par le serveur
  serverSignature?: string; // Signature HMAC d'intégrité
}

export interface AnalysisResult {
  indicatorId: number;
  status: ConformityStatus;
  justification: string;
  recommendations: string[];
}

// Fix: Missing Criterion interface for Qualiopi structure
export interface Criterion {
  id: number;
  title: string;
  description: string;
  indicators: number[];
}

// Fix: Missing Indicator interface for Qualiopi reference
export interface Indicator {
  id: number;
  criterionId: number;
  label: string;
  obligation: string;
  expectedLevel: string;
  nonConformityRisks?: string;
  evidence: string[];
  glossary?: string[];
}

// Fix: Missing AppSettings and related configuration types
export type AuditType = 'Initial' | 'Surveillance' | 'Renouvellement';

export interface ContactInfo {
  firstName: string;
  lastName: string;
  email: string;
}

export interface AppSettings {
  account: {
    firstName: string;
    lastName: string;
    email: string;
    companyName: string;
    role: string;
    position: string;
    password?: string;
  };
  audit: {
    status: string;
    nextAuditDate: string;
    type: AuditType;
  };
  typology: {
    organismType: OrganismType;
    isCertifying: boolean;
    isNonCertifying: boolean;
    hasAFEST: boolean;
    isAlternance: boolean;
    hasHandicapReferent: boolean;
    acceptsHandicap: boolean;
    usesSubcontractors: boolean;
    hasLMS: boolean;
    isSubcontractorOnly: boolean;
    hasPrerequisites: boolean;
    isShortFormat: boolean;
    noSubcontracting: boolean;
    hasWorkPeriods: boolean;
    isCFA: boolean;
  };
  stats: {
    activeFormationsCount: number;
    internalFormersCount: number;
    externalFormersCount: number;
    hasQualityManager: boolean;
  };
  legal: {
    siret: string;
    tva: string;
    nda: string;
    address: string;
  };
  contacts: {
    pedagogic: ContactInfo;
    commercial: ContactInfo;
    dpo: ContactInfo;
  };
  additionalUsers: ContactInfo[];
  setupComplete: boolean;
}

// Fix: Missing User and Workspace types
export interface UserData {
  id: string;
  email: string;
  settings: AppSettings;
}

export interface AuditState {
  indicatorId: number;
  status: 'Ready' | 'NotReady' | 'InProgress';
}

export interface NonConformity {
  id: string;
  type: 'Mineure' | 'Majeure';
  indicatorId: number;
  description: string;
  status: 'Open' | 'Closed';
  createdAt: string;
}

// ============================================================================
// TYPES VEILLE FORMATION
// ============================================================================

export type VeilleSourceType = 'rss' | 'atom' | 'html';
export type VeilleSensitivity = 'low' | 'normal' | 'high' | 'critical';
export type VeilleRuleOperator = 'AND' | 'OR' | 'NOT';
export type VeilleDeliveryMethod = 'email' | 'digest' | 'in_app';
export type VeilleSeverity = 'critique' | 'alerte' | 'info';
export type VeilleTheme = 'legal' | 'pedagogique' | 'competences' | 'opco' | 'reglementaire';

/**
 * Source de veille configurée (RSS/Atom/HTML)
 */
export interface VeilleSource {
  id: string;
  name: string;
  url: string;
  source_type: VeilleSourceType;
  css_selector?: string;
  frequency_minutes: number;
  active: boolean;
  last_fetched_at?: string;
  last_error?: string;
  metadata?: {
    priority?: 'low' | 'medium' | 'high';
    category?: VeilleTheme;
    [key: string]: any;
  };
  created_at: string;
  updated_at: string;
}

/**
 * Article/actualité collecté depuis une source
 */
export interface VeilleItem {
  id: string;
  source_id: string;
  external_id?: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  author?: string;
  published_at?: string;
  fetched_at: string;
  image_url?: string;
  tags: string[];
  metadata?: Record<string, any>;
  created_at: string;
  // Champs enrichis par jointure
  source_name?: string;
  source_type?: VeilleSourceType;
  // Champs UI
  severity?: VeilleSeverity;
  impacted_indicators?: number[];
  is_saved?: boolean;
}

/**
 * Mot-clé pour le matching d'alertes
 */
export interface VeilleKeyword {
  id: string;
  user_id: string;
  label: string;
  sensitivity: VeilleSensitivity;
  active: boolean;
  created_at: string;
}

/**
 * Expression JSON pour les règles d'alertes
 */
export interface VeilleRuleExpression {
  operator: VeilleRuleOperator;
  terms: string[];
  not_terms?: string[];
}

/**
 * Règle d'alerte configurée par utilisateur
 */
export interface VeilleRule {
  id: string;
  user_id: string;
  name: string;
  expression_json: VeilleRuleExpression;
  notification_email?: string;
  notify_immediate: boolean;
  notify_digest: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Alerte déclenchée
 */
export interface VeilleAlert {
  id: string;
  rule_id: string;
  item_id: string;
  user_id: string;
  triggered_at: string;
  delivered_at?: string;
  read_at?: string;
  delivery_method?: VeilleDeliveryMethod;
  // Champs enrichis par jointure
  rule_name?: string;
  item_title?: string;
  item_url?: string;
}

/**
 * Article sauvegardé par l'utilisateur
 */
export interface VeilleSavedItem {
  id: string;
  user_id: string;
  item_id: string;
  notes?: string;
  created_at: string;
  // Item enrichi
  item?: VeilleItem;
}

/**
 * Filtres pour la recherche d'items de veille
 */
export interface VeilleFilters {
  search?: string;
  source_id?: string;
  theme?: VeilleTheme;
  date_from?: string;
  date_to?: string;
  severity?: VeilleSeverity;
  saved_only?: boolean;
}

/**
 * Stats du dashboard veille
 */
export interface VeilleStats {
  total_items: number;
  items_today: number;
  items_this_week: number;
  unread_alerts: number;
  saved_count: number;
  sources_active: number;
  sources_error: number;
}

/**
 * Ancienne interface de compatibilité (déprécié)
 * @deprecated Utiliser VeilleItem à la place
 */
export interface VeilleAlertLegacy {
  id: string;
  title: string;
  date: string;
  source: string;
}

export interface UserWorkspace {
  settings: AppSettings;
  reports: DocumentAnalysisReport[];
  ncList: NonConformity[];
  docs: any[];
  auditStates: AuditState[];
}
