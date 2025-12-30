-- ============================================
-- SCHEMA EMAIL QUEUE - QualiApps
-- ============================================
-- Table pour gérer l'envoi asynchrone des emails
-- À exécuter après 03-veille-schema.sql

-- Table de queue d'emails
CREATE TABLE IF NOT EXISTS email_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Destinataire et contenu
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Statut
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'sent', 'failed', 'cancelled')),
    
    -- Tentatives et erreurs
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    last_error TEXT,
    
    -- Métadonnées (pour tracking)
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ,
    sent_at TIMESTAMPTZ
);

-- Index pour le traitement de la queue
CREATE INDEX IF NOT EXISTS idx_email_queue_status ON email_queue(status);
CREATE INDEX IF NOT EXISTS idx_email_queue_scheduled ON email_queue(scheduled_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_email_queue_created ON email_queue(created_at);

-- Table de logs d'envoi (pour historique et debug)
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_queue_id UUID REFERENCES email_queue(id) ON DELETE SET NULL,
    
    to_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    
    -- Résultat
    success BOOLEAN NOT NULL,
    provider_response JSONB,
    error_message TEXT,
    
    -- Timestamps
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_logs_queue ON email_logs(email_queue_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_sent ON email_logs(sent_at);

-- Vue pour les emails en attente de traitement
CREATE OR REPLACE VIEW pending_emails AS
SELECT 
    id,
    to_email,
    subject,
    html_content,
    attempts,
    max_attempts,
    created_at,
    scheduled_at
FROM email_queue
WHERE status = 'pending'
  AND scheduled_at <= NOW()
  AND attempts < max_attempts
ORDER BY scheduled_at ASC
LIMIT 100;

-- Fonction pour marquer un email comme en cours de traitement
CREATE OR REPLACE FUNCTION claim_email(email_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    claimed BOOLEAN;
BEGIN
    UPDATE email_queue
    SET status = 'processing',
        attempts = attempts + 1,
        processed_at = NOW()
    WHERE id = email_id
      AND status = 'pending'
    RETURNING TRUE INTO claimed;
    
    RETURN COALESCE(claimed, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer un email comme envoyé
CREATE OR REPLACE FUNCTION mark_email_sent(email_id UUID, provider_resp JSONB DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
    UPDATE email_queue
    SET status = 'sent',
        sent_at = NOW()
    WHERE id = email_id;
    
    INSERT INTO email_logs (email_queue_id, to_email, subject, success, provider_response)
    SELECT email_id, to_email, subject, TRUE, provider_resp
    FROM email_queue
    WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour marquer un email comme échoué
CREATE OR REPLACE FUNCTION mark_email_failed(email_id UUID, error_msg TEXT)
RETURNS VOID AS $$
DECLARE
    current_attempts INTEGER;
    max_att INTEGER;
BEGIN
    SELECT attempts, max_attempts INTO current_attempts, max_att
    FROM email_queue WHERE id = email_id;
    
    IF current_attempts >= max_att THEN
        UPDATE email_queue
        SET status = 'failed',
            last_error = error_msg
        WHERE id = email_id;
    ELSE
        UPDATE email_queue
        SET status = 'pending',
            last_error = error_msg
        WHERE id = email_id;
    END IF;
    
    INSERT INTO email_logs (email_queue_id, to_email, subject, success, error_message)
    SELECT email_id, to_email, subject, FALSE, error_msg
    FROM email_queue
    WHERE id = email_id;
END;
$$ LANGUAGE plpgsql;

-- RLS Policies (lecture seule pour les utilisateurs, écriture via service role)
ALTER TABLE email_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;

-- Seul le service role peut accéder à ces tables
-- (pas de policies = accès refusé par défaut)

COMMENT ON TABLE email_queue IS 'Queue d''emails pour envoi asynchrone';
COMMENT ON TABLE email_logs IS 'Historique des envois d''emails';

