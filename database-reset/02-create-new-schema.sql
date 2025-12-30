-- ============================================================================
-- ÉTAPE 2: CRÉER LE NOUVEAU SCHÉMA AVEC TABLE USERS PERSONNALISÉE
-- ============================================================================
-- 
-- Ce schéma utilise une table `users` personnalisée (PAS auth.users)
-- Authentification simple: email + mot de passe (hashé avec pgcrypto)
-- Pas de vérification email requise
--
-- ============================================================================

-- Activer l'extension pgcrypto pour le hashage des mots de passe
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- TABLE: users (Authentification personnalisée)
-- ============================================================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_login_at TIMESTAMPTZ
);

-- Index pour recherche rapide par email
CREATE INDEX idx_users_email ON public.users(email);

-- ============================================================================
-- TABLE: profiles (Paramètres utilisateur et configuration)
-- ============================================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT profiles_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);

-- ============================================================================
-- TABLE: reports (Rapports d'analyse IA)
-- ============================================================================
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  data JSONB NOT NULL,
  verified_by_server BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_reports_user_id ON public.reports(user_id);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);

-- ============================================================================
-- TABLE: documents (Documents uploadés)
-- ============================================================================
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT,
  size INTEGER,
  url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_documents_user_id ON public.documents(user_id);

-- ============================================================================
-- TABLE: non_conformities (Non-conformités d'audit)
-- ============================================================================
CREATE TABLE public.non_conformities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  indicator_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity TEXT CHECK (severity IN ('Mineure', 'Majeure')),
  status TEXT DEFAULT 'Open' CHECK (status IN ('Open', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_nc_user_id ON public.non_conformities(user_id);
CREATE INDEX idx_nc_indicator_id ON public.non_conformities(indicator_id);

-- ============================================================================
-- TABLE: audit_states (États d'audit par indicateur)
-- ============================================================================
CREATE TABLE public.audit_states (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  indicator_id INTEGER NOT NULL,
  status TEXT DEFAULT 'NotReady' CHECK (status IN ('Ready', 'NotReady', 'InProgress')),
  score INTEGER,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT audit_states_user_indicator_unique UNIQUE (user_id, indicator_id)
);

CREATE INDEX idx_audit_states_user_id ON public.audit_states(user_id);

-- ============================================================================
-- FONCTIONS D'AUTHENTIFICATION
-- ============================================================================

-- Fonction pour créer un utilisateur (inscription)
CREATE OR REPLACE FUNCTION public.register_user(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE(user_id UUID, email TEXT, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user_id UUID;
BEGIN
  -- Vérifier si l'email existe déjà
  IF EXISTS (SELECT 1 FROM public.users WHERE users.email = LOWER(p_email)) THEN
    RETURN QUERY SELECT NULL::UUID, p_email, false, 'Cet email est déjà utilisé'::TEXT;
    RETURN;
  END IF;
  
  -- Créer l'utilisateur avec mot de passe hashé
  INSERT INTO public.users (email, password_hash)
  VALUES (LOWER(p_email), crypt(p_password, gen_salt('bf', 10)))
  RETURNING id INTO v_user_id;
  
  -- Créer le profil par défaut
  INSERT INTO public.profiles (user_id, settings)
  VALUES (v_user_id, '{}'::jsonb);
  
  RETURN QUERY SELECT v_user_id, LOWER(p_email), true, 'Inscription réussie'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour authentifier un utilisateur (connexion)
CREATE OR REPLACE FUNCTION public.authenticate_user(
  p_email TEXT,
  p_password TEXT
) RETURNS TABLE(user_id UUID, email TEXT, success BOOLEAN, message TEXT) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Rechercher l'utilisateur
  SELECT * INTO v_user FROM public.users 
  WHERE users.email = LOWER(p_email) AND is_active = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT NULL::UUID, p_email, false, 'Email ou mot de passe incorrect'::TEXT;
    RETURN;
  END IF;

  -- Vérifier le mot de passe
  IF v_user.password_hash != crypt(p_password, v_user.password_hash) THEN
    RETURN QUERY SELECT NULL::UUID, p_email, false, 'Email ou mot de passe incorrect'::TEXT;
    RETURN;
  END IF;

  -- Mettre à jour last_login_at
  UPDATE public.users SET last_login_at = now() WHERE id = v_user.id;

  RETURN QUERY SELECT v_user.id, v_user.email, true, 'Connexion réussie'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Activer RLS sur toutes les tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.non_conformities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_states ENABLE ROW LEVEL SECURITY;

-- Politiques pour users (lecture publique pour auth, écriture restreinte)
CREATE POLICY "users_select_own" ON public.users FOR SELECT USING (true);
CREATE POLICY "users_insert_anon" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "users_update_own" ON public.users FOR UPDATE USING (true);

-- Politiques pour profiles
CREATE POLICY "profiles_all" ON public.profiles FOR ALL USING (true);

-- Politiques pour reports
CREATE POLICY "reports_all" ON public.reports FOR ALL USING (true);

-- Politiques pour documents
CREATE POLICY "documents_all" ON public.documents FOR ALL USING (true);

-- Politiques pour non_conformities
CREATE POLICY "nc_all" ON public.non_conformities FOR ALL USING (true);

-- Politiques pour audit_states
CREATE POLICY "audit_states_all" ON public.audit_states FOR ALL USING (true);

-- ============================================================================
-- TRIGGER: Mise à jour automatique de updated_at
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER reports_updated_at BEFORE UPDATE ON public.reports
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER nc_updated_at BEFORE UPDATE ON public.non_conformities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER audit_states_updated_at BEFORE UPDATE ON public.audit_states
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- VÉRIFICATION FINALE
-- ============================================================================
SELECT
  tablename as "Table",
  'Créée ✅' as "Status"
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- ============================================================================
-- PROCHAINE ÉTAPE: Mettez à jour le code d'authentification
-- Voir le fichier 03-auth-migration-guide.md
-- ============================================================================

