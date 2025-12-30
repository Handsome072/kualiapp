-- ============================================================================
-- ÉTAPE 1: SUPPRIMER TOUTES LES TABLES EXISTANTES
-- ============================================================================
--
-- ⚠️ ATTENTION: Ceci va SUPPRIMER TOUTES LES DONNÉES !
-- Faites une sauvegarde si nécessaire.
--
-- Exécutez dans Supabase SQL Editor:
-- https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new
--
-- ============================================================================

-- Supprimer toutes les tables (ordre respectant les clés étrangères)
DROP TABLE IF EXISTS public.audit_states CASCADE;
DROP TABLE IF EXISTS public.documents CASCADE;
DROP TABLE IF EXISTS public.non_conformities CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.QualiApps CASCADE;

-- Vérifier que toutes les tables sont supprimées
SELECT
  schemaname,
  tablename
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Résultat attendu: Liste vide (aucune table dans le schéma public)

-- ============================================================================
-- PROCHAINE ÉTAPE: Exécutez 02-create-new-schema.sql
-- ============================================================================

