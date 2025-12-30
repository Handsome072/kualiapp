
import createDOMPurify from 'dompurify';

const DOMPurify = typeof window !== 'undefined' ? createDOMPurify(window) : null;

/**
 * Configure un assainisseur strict pour les rapports d'audit.
 * Autorise uniquement la mise en forme basique.
 */
export const sanitizeHTML = (dirty: string): string => {
  if (!DOMPurify) return dirty;

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li', 'ol'],
    ALLOWED_ATTR: [], // Aucun attribut (style, href, onclick) n'est autorisé
    ALLOW_DATA_ATTR: false,
    USE_PROFILES: { html: true }
  }) as string;
};

/**
 * Prévient les injections de caractères invisibles ou de contrôle
 */
export const cleanTextContent = (text: string): string => {
  return text.replace(/[\u0000-\u001F\u007F-\u009F]/g, "");
};
