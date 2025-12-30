
/**
 * Service DPO : Protection des données personnelles
 */

// Patterns pour identifier les DCP communes
const PII_PATTERNS = {
  email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
  phone: /(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}/g,
  // Pattern simplifié pour les noms (souvent après M., Mme, ou dans des signatures)
  // En production réelle, on utiliserait un modèle de NER (Named Entity Recognition) local.
  names: /\b(?:M\.|Mme|Monsieur|Madame)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?/g,
  siret: /\b\d{14}\b/g
};

/**
 * Nettoie le texte de toute DCP évidente avant envoi à Gemini.
 */
export const anonymizeContent = (text: string): string => {
  let cleaned = text;
  
  cleaned = cleaned.replace(PII_PATTERNS.email, "[EMAIL_ANONYMISÉ]");
  cleaned = cleaned.replace(PII_PATTERNS.phone, "[TÉLÉPHONE_ANONYMISÉ]");
  cleaned = cleaned.replace(PII_PATTERNS.names, (match) => match.split(' ')[0] + " [NOM_CACHÉ]");
  cleaned = cleaned.replace(PII_PATTERNS.siret, "[SIRET_ANONYMISÉ]");

  return cleaned;
};

/**
 * Vérifie si le texte contient des données sensibles critiques (santé, mineurs)
 */
export const detectSensitiveData = (text: string): boolean => {
  const sensitiveKeywords = ['handicap', 'RQTH', 'médical', 'santé', 'mineur', 'naissance', 'enfant'];
  return sensitiveKeywords.some(keyword => text.toLowerCase().includes(keyword.toLowerCase()));
};
