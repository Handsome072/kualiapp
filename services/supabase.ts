
import { createClient } from '@supabase/supabase-js';

/**
 * Configuration Supabase pour Next.js
 * Utilise les variables d'environnement définies dans .env.local
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY');
}

// Initialisation du client Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
