
import { Criterion, Indicator } from './types';

export const QUALIOPI_CRITERIA: Criterion[] = [
  { id: 1, title: "Information du public", description: "Les conditions d’information du public sur les prestations proposées, les délais pour y accéder et les résultats obtenus.", indicators: [1, 2, 3] },
  { id: 2, title: "Conception des prestations", description: "L’identification précise des objectifs des prestations proposées et l’adaptation de ces prestations aux publics bénéficiaires lors de la conception des prestations.", indicators: [4, 5, 6, 7, 8] },
  { id: 3, title: "Adaptation aux publics", description: "L’adaptation aux publics bénéficiaires des prestations et des modalités d’accueil, d’accompagnement, de suivi et d’évaluation mises en œuvre.", indicators: [9, 10, 11, 12, 13, 14, 15, 16] },
  { id: 4, title: "Moyens mis en œuvre", description: "L’adéquation des moyens pédagogiques, techniques et d’encadrement aux prestations mises en œuvre.", indicators: [17, 18, 19, 20] },
  { id: 5, title: "Qualification du personnel", description: "La qualification et le développement des connaissances et compétences des personnels chargés de mettre en œuvre les prestations.", indicators: [21, 22] },
  { id: 6, title: "Environnement professionnel", description: "L’inscription et l’investissement du prestataire dans son environnement professionnel.", indicators: [23, 24, 25, 26, 27, 28, 29] },
  { id: 7, title: "Appréciations et réclamations", description: "Le recueil et la prise en compte des appréciations et des réclamations formulées par les parties prenantes aux prestations délivrées.", indicators: [30, 31, 32] },
];

export interface IndicatorProofMap {
  indicatorId: number;
  genericSubject: string;
  subject: string;
  documents: string[];
}

export const QUALIOPI_PROOF_MAP: IndicatorProofMap[] = [
  { indicatorId: 1, genericSubject: "Communication", subject: "Information sur les prestations proposées", documents: ["Plaquette de formation", "Site internet", "Conditions générales de vente (CGV)"] },
  { indicatorId: 2, genericSubject: "Communication", subject: "Diffusion des indicateurs de résultats", documents: ["Rapport d'activités", "Site internet"] },
  { indicatorId: 3, genericSubject: "Communication", subject: "Taux d'obtention des certifications", documents: ["Tableau des taux de réussite", "Information sur les blocs de compétences"] },
  { indicatorId: 4, genericSubject: "Besoins des bénéficiaires", subject: "Analyse des besoins des bénéficiaires", documents: ["Grille d'analyse des besoins", "Dossier acheteur"] },
  { indicatorId: 5, genericSubject: "Besoins des bénéficiaires", subject: "Définition des objectifs de formation", documents: ["Référentiel de formation"] },
  { indicatorId: 6, genericSubject: "Besoins des bénéficiaires", subject: "Conception des formations", documents: ["Programme de formation", "Séquences pédagogiques"] },
  { indicatorId: 7, genericSubject: "Besoins des bénéficiaires", subject: "Adéquation aux certifications visées", documents: ["Fiches RNCP"] },
  { indicatorId: 8, genericSubject: "Besoins des bénéficiaires", subject: "Procédures de positionnement", documents: ["Tests de positionnement", "Dossier d'inscription"] },
  { indicatorId: 9, genericSubject: "Information et suivi des bénéficiaires", subject: "Information sur le déroulement des formations", documents: ["Livret d'accueil", "Règlement intérieur"] },
  { indicatorId: 10, genericSubject: "Information et suivi des bénéficiaires", subject: "Suivi et accompagnement des apprenants", documents: ["Livret de suivi pédagogique", "Bilans intermédiaires"] },
  { indicatorId: 11, genericSubject: "Information et suivi des bénéficiaires", subject: "Évaluation des acquis", documents: ["Livret d'évaluations", "Procès-verbal des examens"] },
  { indicatorId: 12, genericSubject: "Information et suivi des bénéficiaires", subject: "Prévention des abandons", documents: ["Registre des abandons et actions correctives"] },
  { indicatorId: 13, genericSubject: "Adéquation des moyens", subject: "Adaptation aux personnes handicapées", documents: ["Plan d'aménagements spécifiques"] },
  { indicatorId: 14, genericSubject: "Adéquation des moyens", subject: "Qualité des infrastructures", documents: ["Liste des équipements", "Registre d'accessibilité"] },
  { indicatorId: 15, genericSubject: "Adéquation des moyens", subject: "Utilisation des outils numériques", documents: ["Documentation LMS + VISIO"] },
  { indicatorId: 16, genericSubject: "Adéquation des moyens", subject: "Accès aux ressources pédagogiques", documents: ["Liste des ressources pédagogiques"] },
  { indicatorId: 17, genericSubject: "Adéquation des moyens", subject: "Organisation et encadrement pédagogique", documents: ["Organigramme fonctionnel"] },
  { indicatorId: 18, genericSubject: "Adéquation des moyens", subject: "Gestion des intervenants", documents: ["Contrats de prestation"] },
  { indicatorId: 19, genericSubject: "Adéquation des moyens", subject: "Identification des compétences", documents: ["Grilles de compétences"] },
  { indicatorId: 20, genericSubject: "Qualification et développement des compétences", subject: "Processus de recrutement", documents: ["Dossiers de recrutement"] },
  { indicatorId: 21, genericSubject: "Qualification et développement des compétences", subject: "Qualification et formation des formateurs", documents: ["CV des intervenants", "Plan de formation continue"] },
  { indicatorId: 22, genericSubject: "Qualification et développement des compétences", subject: "Qualification et formation des formateurs", documents: ["Suivi des formations des formateurs"] },
  { indicatorId: 23, genericSubject: "Environnement professionnel", subject: "Veille sectorielle", documents: ["Rapports de veille"] },
  { indicatorId: 24, genericSubject: "Environnement professionnel", subject: "Mise à jour des programmes", documents: ["Mises à jour des référentiels"] },
  { indicatorId: 25, genericSubject: "Environnement professionnel", subject: "Innovation pédagogique", documents: ["Projets d'innovation pédagogique"] },
  { indicatorId: 26, genericSubject: "Environnement professionnel", subject: "Utilisation des outils numériques", documents: ["Documentation"] },
  { indicatorId: 27, genericSubject: "Environnement professionnel", subject: "Évolution des métiers et des compétences", documents: ["Études sur l'évolution des métiers"] },
  { indicatorId: 28, genericSubject: "Environnement professionnel", subject: "Évaluation des pratiques", documents: ["Rapports d'évaluation des pratiques"] },
  { indicatorId: 29, genericSubject: "Parties prenantes et amélioration continue", subject: "Recueil des réclamations", documents: ["Tableau de suivi des réclamations"] },
  { indicatorId: 30, genericSubject: "Parties prenantes et amélioration continue", subject: "Analyse des dysfonctionnements", documents: ["Rapport d'analyse des dysfonctionnements"] },
  { indicatorId: 31, genericSubject: "Parties prenantes et amélioration continue", subject: "Mise en place d'actions correctives", documents: ["Plans d'action correctifs"] },
  { indicatorId: 32, genericSubject: "Parties prenantes et amélioration continue", subject: "Amélioration continue du dispositif", documents: ["Rapports d'amélioration continue"] },
];

export const QUALIOPI_INDICATORS: Indicator[] = [
  {
    id: 1, 
    criterionId: 1, 
    label: "Information détaillée sur les prestations",
    obligation: "Le prestataire diffuse une information accessible au public, détaillée et vérifiable sur les prestations proposées : prérequis, objectifs, durée, modalités et délais d'accès, tarifs, contacts, méthodes mobilisées et modalités d'évaluation, accessibilité aux personnes handicapées.",
    expectedLevel: "Démontrer que l'information est accessible, exhaustive, datée et actualisée.",
    nonConformityRisks: "Le défaut d'information sur l'un des items constitue une non-conformité majeure.",
    evidence: ["Site internet", "Plaquette tarifaire", "Programmes de formation", "Conditions Générales de Vente", "Livret d'accueil", "Réseaux sociaux"],
    glossary: ["Accessibilité : possibilité pour tous, notamment les personnes handicapées, d'accéder aux locaux et aux prestations.", "Délais d'accès : durée entre la demande du bénéficiaire et le début de la prestation."]
  },
  {
    id: 2, 
    criterionId: 1, 
    label: "Indicateurs de résultats",
    obligation: "Le prestataire diffuse des indicateurs de résultats adaptés aux prestations proposées et aux publics accueillis.",
    expectedLevel: "Donner une information chiffrée sur le niveau de performance.",
    evidence: ["Taux de satisfaction", "Taux de réussite aux examens", "Taux d'insertion professionnelle", "Nombre de bénéficiaires"]
  },
  {
    id: 3, 
    criterionId: 1, 
    label: "Certifications professionnelles",
    obligation: "Lorsque le prestataire délivre des prestations conduisant à une certification professionnelle, il informe sur les taux d'obtention, les équivalences et passerelles.",
    expectedLevel: "Informer précisément sur les débouchés et la reconnaissance du titre.",
    evidence: ["Parchemins", "Tableaux de correspondance RNCP", "Stats d'insertion à 6 mois"]
  },
  {
    id: 4, 
    criterionId: 2, 
    label: "Analyse du besoin",
    expectedLevel: "Démontrer comment le besoin est analysé en fonction de la finalité.",
    obligation: "Le prestataire analyse le besoin du bénéficiaire en lien avec l'entreprise et/ou le financeur.",
    evidence: ["Grilles de diagnostic", "Compte-rendu d'entretien de positionnement"]
  },
  {
    id: 5, 
    criterionId: 2, 
    label: "Objectifs opérationnels",
    expectedLevel: "Démontrer que les objectifs sont opérationnels et évaluables.",
    obligation: "Le prestataire définit des objectifs opérationnels et évaluables de la prestation.",
    evidence: ["Programme détaillé", "Référentiel d'évaluation"]
  },
  {
    id: 6, criterionId: 2, label: "Conception des formations", expectedLevel: "Démontrer la cohérence entre les contenus et les objectifs.", obligation: "Le prestataire établit des contenus et des modalités pédagogiques adaptés.", evidence: ["Programme de formation", "Séquences pédagogiques"]
  },
  {
    id: 30, 
    criterionId: 7, 
    label: "Recueil des appréciations",
    obligation: "Le prestataire recueille les appréciations des parties prenantes : bénéficiaires, financeurs, entreprises et équipes pédagogiques.",
    expectedLevel: "Système de collecte à fréquence pertinente incluant relances.",
    evidence: ["Questionnaires de satisfaction à chaud et à froid", "Synthèse annuelle"]
  },
  { id: 7, criterionId: 2, label: "Adéquation aux certifications", expectedLevel: "Vérifier la validité du titre visé.", obligation: "S'assurer de l'enregistrement au RNCP.", evidence: ["Fiches RNCP"] },
  { id: 8, criterionId: 2, label: "Procédures de positionnement", expectedLevel: "Démontrer le test des acquis en entrée.", obligation: "Vérifier l'adéquation profil/prestation.", evidence: ["Tests de positionnement"] },
  { id: 9, criterionId: 3, label: "Information déroulement formation", expectedLevel: "Transmettre les règles de vie et organisation.", obligation: "Diffuser règlement intérieur et livret.", evidence: ["Livret d'accueil"] },
  { id: 10, criterionId: 3, label: "Suivi et accompagnement", expectedLevel: "Tracer les étapes de progression.", obligation: "Assurer un suivi individuel.", evidence: ["Livret de suivi"] },
  { id: 11, criterionId: 3, label: "Évaluation des acquis", expectedLevel: "Valider les compétences en fin de parcours.", obligation: "Organiser des évaluations sommatives.", evidence: ["Livret d'évaluations"] },
  { id: 12, criterionId: 3, label: "Prévention des abandons", expectedLevel: "Limiter les ruptures de parcours.", obligation: "Détecter et traiter les risques d'abandon.", evidence: ["Registre abandons"] },
  { id: 13, criterionId: 3, label: "Adaptation handicap", expectedLevel: "Assurer l'accueil de tous publics.", obligation: "Prévoir des aménagements spécifiques.", evidence: ["Plan handicap"] },
  { id: 14, criterionId: 3, label: "Moyens techniques", expectedLevel: "Locaux et outils conformes.", obligation: "Garantir des infrastructures adaptées.", evidence: ["Liste équipements"] },
  { id: 15, criterionId: 3, label: "Ressources numériques", expectedLevel: "Outils digitaux fonctionnels.", obligation: "Former à l'usage du numérique.", evidence: ["Documentation LMS"] },
  { id: 16, criterionId: 3, label: "Ressources pédagogiques", expectedLevel: "Supports de cours à jour.", obligation: "Mettre à disposition les supports.", evidence: ["Supports de cours"] },
  { id: 17, criterionId: 4, label: "Organisation pédagogique", expectedLevel: "Équipe coordonnée.", obligation: "Structurer l'encadrement.", evidence: ["Organigramme"] },
  { id: 18, criterionId: 4, label: "Intervenants externes", expectedLevel: "Contrats et suivi clairs.", obligation: "Gérer les prestataires.", evidence: ["Contrats prestation"] },
  { id: 19, criterionId: 4, label: "Ressources humaines", expectedLevel: "Compétences identifiées.", obligation: "Vérifier les habilitations.", evidence: ["Grille compétences"] },
  { id: 20, criterionId: 4, label: "Recrutement personnel", expectedLevel: "Processus de sélection objectif.", obligation: "Professionnaliser le recrutement.", evidence: ["Dossier recrutement"] },
  { id: 21, criterionId: 5, label: "Compétences formateurs", expectedLevel: "Expertise métier prouvée.", obligation: "Maintenir le niveau des formateurs.", evidence: ["CV intervenants"] },
  { id: 22, criterionId: 5, label: "Formation continue", expectedLevel: "Plan de développement annuel.", obligation: "Investir dans la formation RH.", evidence: ["Plan formation"] },
  { id: 23, criterionId: 6, label: "Veille réglementaire", expectedLevel: "Conformité légale maintenue.", obligation: "Veiller sur les lois formation.", evidence: ["Rapport veille légale"] },
  { id: 24, criterionId: 6, label: "Veille métiers", expectedLevel: "Adaptation aux évolutions sectorielles.", obligation: "Anticiper les besoins du marché.", evidence: ["Études métiers"] },
  { id: 25, criterionId: 6, label: "Innovation pédagogique", expectedLevel: "Utilisation de méthodes modernes.", obligation: "Expérimenter et moderniser.", evidence: ["Projets innovation"] },
  { id: 26, criterionId: 6, label: "Veille handicap", expectedLevel: "Expertise accessibilité.", obligation: "Suivre les normes handicap.", evidence: ["Compte-rendu veille handicap"] },
  { id: 27, criterionId: 6, label: "Sous-traitance", expectedLevel: "Contrôle des partenaires.", obligation: "Respecter les règles de délégation.", evidence: ["Charte sous-traitance"] },
  { id: 28, criterionId: 6, label: "AFEST / Alternance", expectedLevel: "Coordination entreprise réussie.", obligation: "Gérer l'immersion pro.", evidence: ["Livret alternance"] },
  { id: 29, criterionId: 6, label: "Réseau partenaires", expectedLevel: "Insertion locale active.", obligation: "Mobiliser les acteurs locaux.", evidence: ["Convention partenariat"] },
  { id: 31, criterionId: 7, label: "Actions correctives", expectedLevel: "Réactivité face aux alertes.", obligation: "Tracer le traitement des écarts.", evidence: ["Plan actions"] },
  { id: 32, criterionId: 7, label: "Amélioration continue", expectedLevel: "Dynamique de progrès prouvée.", obligation: "Exploiter les indicateurs.", evidence: ["Rapport annuel qualité"] },
];
