/**
 * Service d'authentification personnalisé
 * Utilise la table public.users (PAS auth.users de Supabase)
 */

import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser | null;
  success: boolean;
  message: string;
}

// Clé pour stocker la session dans localStorage
const SESSION_KEY = 'qualiapps_session';

/**
 * Inscription d'un nouvel utilisateur
 */
export async function signUp(email: string, password: string): Promise<AuthResult> {
  try {
    const { data, error } = await supabase
      .rpc('register_user', {
        p_email: email,
        p_password: password
      });

    if (error) {
      console.error('Signup error:', error);
      return {
        user: null,
        success: false,
        message: error.message || 'Erreur lors de l\'inscription'
      };
    }

    const result = data?.[0];
    
    if (!result?.success) {
      return {
        user: null,
        success: false,
        message: result?.message || 'Erreur lors de l\'inscription'
      };
    }

    // Sauvegarder la session
    const user: AuthUser = {
      id: result.user_id,
      email: result.email
    };
    saveSession(user);

    return {
      user,
      success: true,
      message: 'Inscription réussie'
    };
  } catch (err: any) {
    console.error('Signup exception:', err);
    return {
      user: null,
      success: false,
      message: err.message || 'Erreur inattendue'
    };
  }
}

/**
 * Connexion d'un utilisateur existant
 */
export async function signIn(email: string, password: string): Promise<AuthResult> {
  console.log('[Auth] Tentative de connexion pour:', email);

  try {
    console.log('[Auth] Appel RPC authenticate_user...');
    const { data, error } = await supabase
      .rpc('authenticate_user', {
        p_email: email,
        p_password: password
      });

    console.log('[Auth] Réponse RPC:', { data, error });

    if (error) {
      console.error('[Auth] Login error:', error);
      // Si la fonction n'existe pas
      if (error.message?.includes('function') || error.code === '42883') {
        return {
          user: null,
          success: false,
          message: 'Fonction authenticate_user non trouvée. Veuillez exécuter le script SQL dans Supabase.'
        };
      }
      return {
        user: null,
        success: false,
        message: error.message || 'Erreur lors de la connexion'
      };
    }

    // La réponse peut être un tableau ou un objet direct
    const result = Array.isArray(data) ? data[0] : data;
    console.log('[Auth] Résultat parsé:', result);

    if (!result?.success) {
      return {
        user: null,
        success: false,
        message: result?.message || 'Email ou mot de passe incorrect'
      };
    }

    // Sauvegarder la session
    const user: AuthUser = {
      id: result.user_id,
      email: result.email
    };
    console.log('[Auth] Utilisateur connecté:', user);
    saveSession(user);

    return {
      user,
      success: true,
      message: 'Connexion réussie'
    };
  } catch (err: any) {
    console.error('[Auth] Login exception:', err);
    return {
      user: null,
      success: false,
      message: err.message || 'Erreur inattendue'
    };
  }
}

/**
 * Déconnexion
 */
export function signOut(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SESSION_KEY);
  }
}

/**
 * Récupérer l'utilisateur connecté
 */
export function getCurrentUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  
  const sessionStr = localStorage.getItem(SESSION_KEY);
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr) as AuthUser;
  } catch {
    return null;
  }
}

/**
 * Vérifier si un utilisateur est connecté
 */
export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

/**
 * Sauvegarder la session utilisateur
 */
function saveSession(user: AuthUser): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  }
}

