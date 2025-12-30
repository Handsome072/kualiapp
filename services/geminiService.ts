
import { DocumentAnalysisReport, OrganismType } from "../types";
import { supabase } from "./supabase";
import { anonymizeContent } from "./privacy";

/**
 * PRODUCTION CRITIQUE : Cette fonction invoque l'Edge Function Supabase
 * avec une étape préalable d'anonymisation RGPD.
 */
export const analyzeDocument = async (
  documentText: string, 
  organismType: OrganismType = 'OF', 
  indicatorId: number
): Promise<DocumentAnalysisReport | null> => {
  if (!documentText || documentText.length < 10) return null;

  try {
    // Étape RGPD : Anonymisation locale avant que les données ne quittent le navigateur
    const safeText = anonymizeContent(documentText);

    const { data, error } = await supabase.functions.invoke('analyze-document-secure', {
      body: { 
        text: safeText, 
        organismType, 
        indicatorId,
        metadata: {
          timestamp: new Date().toISOString(),
          platform: "QualiApps-Production",
          rgpd_compliant: true
        }
      }
    });

    if (error) {
      if (error.message?.includes("injection")) {
        console.error("ALERTE SÉCURITÉ : Tentative d'injection bloquée.");
      }
      throw error;
    }

    return data as DocumentAnalysisReport;
  } catch (error) {
    console.error("Audit Security Error:", error);
    return null;
  }
};
