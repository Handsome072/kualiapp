
import React from 'react';
import { sanitizeHTML } from '../services/security';

interface SecureReportViewProps {
  content: string;
  className?: string;
}

export const SecureReportView: React.FC<SecureReportViewProps> = ({ content, className }) => {
  // On assainit avant le rendu
  const sanitizedContent = sanitizeHTML(content);

  // Utilisation contrôlée de dangerouslySetInnerHTML après sanitisation
  // React 19 gère mieux les types, mais la sanitisation reste externe
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};
