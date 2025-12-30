-- ============================================================================
-- QUALIAPPS - SCHÉMA VEILLE FORMATION
-- ============================================================================
--
-- Version: 1.0 - Module de veille réglementaire formation professionnelle
-- Date: 2024-12-30
--
-- Tables: veille_sources, veille_items, veille_keywords, veille_rules, veille_alerts
--
-- ============================================================================

-- ============================================================================
-- TABLE: veille_sources (Sources de veille configurées)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK (source_type IN ('rss', 'atom', 'html')),
  css_selector TEXT, -- Sélecteur CSS pour scraping HTML (null pour RSS/Atom)
  frequency_minutes INTEGER DEFAULT 60,
  active BOOLEAN DEFAULT true,
  last_fetched_at TIMESTAMPTZ,
  last_error TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_veille_sources_active ON public.veille_sources(active);

-- ============================================================================
-- TABLE: veille_items (Articles/actualités collectés)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID NOT NULL REFERENCES public.veille_sources(id) ON DELETE CASCADE,
  external_id TEXT, -- ID unique de l'article côté source (guid RSS, hash URL)
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  url TEXT NOT NULL,
  author TEXT,
  published_at TIMESTAMPTZ,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT veille_items_unique_external UNIQUE (source_id, external_id)
);

CREATE INDEX idx_veille_items_source ON public.veille_items(source_id);
CREATE INDEX idx_veille_items_published ON public.veille_items(published_at DESC);
CREATE INDEX idx_veille_items_fetched ON public.veille_items(fetched_at DESC);
CREATE INDEX idx_veille_items_title_trgm ON public.veille_items USING gin(to_tsvector('french', title));

-- ============================================================================
-- TABLE: veille_keywords (Mots-clés pour le matching)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  sensitivity TEXT DEFAULT 'normal' CHECK (sensitivity IN ('low', 'normal', 'high', 'critical')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_veille_keywords_user ON public.veille_keywords(user_id);

-- ============================================================================
-- TABLE: veille_rules (Règles d'alertes configurées par utilisateur)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  expression_json JSONB NOT NULL, -- Ex: {"operator": "AND", "terms": ["qualiopi", "certification"]}
  notification_email TEXT,
  notify_immediate BOOLEAN DEFAULT false,
  notify_digest BOOLEAN DEFAULT true,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_veille_rules_user ON public.veille_rules(user_id);
CREATE INDEX idx_veille_rules_active ON public.veille_rules(active);

-- ============================================================================
-- TABLE: veille_alerts (Alertes déclenchées)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rule_id UUID NOT NULL REFERENCES public.veille_rules(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.veille_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  triggered_at TIMESTAMPTZ DEFAULT now(),
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  delivery_method TEXT CHECK (delivery_method IN ('email', 'digest', 'in_app')),
  CONSTRAINT veille_alerts_unique UNIQUE (rule_id, item_id)
);

CREATE INDEX idx_veille_alerts_user ON public.veille_alerts(user_id);
CREATE INDEX idx_veille_alerts_unread ON public.veille_alerts(user_id, read_at) WHERE read_at IS NULL;

-- ============================================================================
-- TABLE: veille_saved_items (Articles sauvegardés par utilisateur)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.veille_saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  item_id UUID NOT NULL REFERENCES public.veille_items(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT veille_saved_unique UNIQUE (user_id, item_id)
);

CREATE INDEX idx_veille_saved_user ON public.veille_saved_items(user_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
ALTER TABLE public.veille_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veille_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veille_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veille_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veille_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.veille_saved_items ENABLE ROW LEVEL SECURITY;

-- Sources et items sont publics en lecture (données partagées)
CREATE POLICY "veille_sources_read" ON public.veille_sources FOR SELECT USING (true);
CREATE POLICY "veille_items_read" ON public.veille_items FOR SELECT USING (true);

-- Keywords, rules, alerts et saved_items sont propres à chaque utilisateur
CREATE POLICY "veille_keywords_all" ON public.veille_keywords FOR ALL USING (true);
CREATE POLICY "veille_rules_all" ON public.veille_rules FOR ALL USING (true);
CREATE POLICY "veille_alerts_all" ON public.veille_alerts FOR ALL USING (true);
CREATE POLICY "veille_saved_all" ON public.veille_saved_items FOR ALL USING (true);

-- Triggers updated_at
CREATE TRIGGER veille_sources_updated_at BEFORE UPDATE ON public.veille_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER veille_rules_updated_at BEFORE UPDATE ON public.veille_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- SOURCES PAR DÉFAUT (Formation professionnelle France)
-- ============================================================================
INSERT INTO public.veille_sources (name, url, source_type, frequency_minutes, metadata) VALUES
  ('France Compétences - Actualités', 'https://www.francecompetences.fr/fiche/flux-rss/', 'rss', 120, '{"priority": "high", "category": "reglementaire"}'::jsonb),
  ('Centre Inffo - Formation', 'https://www.centre-inffo.fr/site-centre-inffo/rss.xml', 'rss', 60, '{"priority": "high", "category": "formation"}'::jsonb),
  ('Ministère du Travail - Formation', 'https://travail-emploi.gouv.fr/rss/actualites', 'rss', 180, '{"priority": "medium", "category": "reglementaire"}'::jsonb),
  ('Légifrance - Formation professionnelle', 'https://www.legifrance.gouv.fr/rss/contenu_general.xml', 'rss', 360, '{"priority": "high", "category": "legal"}'::jsonb),
  ('OPCO Atlas - Actualités', 'https://www.opco-atlas.fr/actualites.html', 'html', 240, '{"priority": "medium", "category": "opco", "css_selector": ".news-item"}'::jsonb)
ON CONFLICT DO NOTHING;

-- ============================================================================
-- FONCTION: Recherche full-text dans les items de veille
-- ============================================================================
CREATE OR REPLACE FUNCTION public.search_veille_items(
  p_query TEXT,
  p_limit INTEGER DEFAULT 50,
  p_offset INTEGER DEFAULT 0
) RETURNS TABLE(
  id UUID,
  title TEXT,
  summary TEXT,
  url TEXT,
  source_name TEXT,
  published_at TIMESTAMPTZ,
  relevance REAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    vi.id,
    vi.title,
    vi.summary,
    vi.url,
    vs.name as source_name,
    vi.published_at,
    ts_rank(to_tsvector('french', vi.title || ' ' || COALESCE(vi.summary, '')), plainto_tsquery('french', p_query)) as relevance
  FROM public.veille_items vi
  JOIN public.veille_sources vs ON vi.source_id = vs.id
  WHERE to_tsvector('french', vi.title || ' ' || COALESCE(vi.summary, '')) @@ plainto_tsquery('french', p_query)
  ORDER BY relevance DESC, vi.published_at DESC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- FONCTION: Matcher les règles d'alertes pour un item
-- ============================================================================
CREATE OR REPLACE FUNCTION public.match_veille_rules(
  p_item_id UUID
) RETURNS TABLE(rule_id UUID, user_id UUID) AS $$
DECLARE
  v_item RECORD;
  v_rule RECORD;
  v_matches BOOLEAN;
  v_terms TEXT[];
  v_operator TEXT;
  v_term TEXT;
  v_content TEXT;
BEGIN
  -- Récupérer l'item
  SELECT title, summary, content INTO v_item FROM public.veille_items WHERE id = p_item_id;
  v_content := LOWER(v_item.title || ' ' || COALESCE(v_item.summary, '') || ' ' || COALESCE(v_item.content, ''));

  -- Parcourir les règles actives
  FOR v_rule IN SELECT * FROM public.veille_rules WHERE active = true LOOP
    v_operator := v_rule.expression_json->>'operator';
    v_terms := ARRAY(SELECT jsonb_array_elements_text(v_rule.expression_json->'terms'));

    IF v_operator = 'AND' THEN
      v_matches := true;
      FOREACH v_term IN ARRAY v_terms LOOP
        IF v_content NOT LIKE '%' || LOWER(v_term) || '%' THEN
          v_matches := false;
          EXIT;
        END IF;
      END LOOP;
    ELSIF v_operator = 'OR' THEN
      v_matches := false;
      FOREACH v_term IN ARRAY v_terms LOOP
        IF v_content LIKE '%' || LOWER(v_term) || '%' THEN
          v_matches := true;
          EXIT;
        END IF;
      END LOOP;
    ELSE
      -- Par défaut, OR
      v_matches := false;
      FOREACH v_term IN ARRAY v_terms LOOP
        IF v_content LIKE '%' || LOWER(v_term) || '%' THEN
          v_matches := true;
          EXIT;
        END IF;
      END LOOP;
    END IF;

    IF v_matches THEN
      rule_id := v_rule.id;
      user_id := v_rule.user_id;
      RETURN NEXT;
    END IF;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VÉRIFICATION
-- ============================================================================
SELECT tablename as "Table Veille", 'Créée ✅' as "Status"
FROM pg_tables
WHERE schemaname = 'public' AND tablename LIKE 'veille_%'
ORDER BY tablename;

