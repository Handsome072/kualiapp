/**
 * API Route: /api/veille/send-emails
 * 
 * Traite la queue d'emails et envoie les notifications
 * Supporte plusieurs providers: Resend, SendGrid, ou logs en dev
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface QueuedEmail {
  id: string;
  to_email: string;
  subject: string;
  html_content: string;
  text_content?: string;
  attempts: number;
  max_attempts: number;
}

// Envoyer un email via Resend
async function sendViaResend(email: QueuedEmail): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    return { success: false, error: 'RESEND_API_KEY non configurée' };
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'QualiApps <noreply@qualiapps.fr>',
        to: [email.to_email],
        subject: email.subject,
        html: email.html_content,
        text: email.text_content
      })
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, response: data };
    } else {
      return { success: false, error: data.message || 'Erreur Resend' };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur réseau' };
  }
}

// Envoyer via SendGrid (alternative)
async function sendViaSendGrid(email: QueuedEmail): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const sendgridApiKey = process.env.SENDGRID_API_KEY;
  
  if (!sendgridApiKey) {
    return { success: false, error: 'SENDGRID_API_KEY non configurée' };
  }

  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendgridApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: email.to_email }] }],
        from: { email: process.env.EMAIL_FROM || 'noreply@qualiapps.fr' },
        subject: email.subject,
        content: [
          { type: 'text/html', value: email.html_content }
        ]
      })
    });

    if (response.ok || response.status === 202) {
      return { success: true, response: { status: response.status } };
    } else {
      const data = await response.json().catch(() => ({}));
      return { success: false, error: JSON.stringify(data) };
    }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Erreur réseau' };
  }
}

// Mode développement: log seulement
function sendViaDev(email: QueuedEmail): { success: boolean; response?: unknown; error?: string } {
  console.log('📧 [DEV] Email simulé:');
  console.log(`   To: ${email.to_email}`);
  console.log(`   Subject: ${email.subject}`);
  console.log(`   Content: ${email.html_content.substring(0, 200)}...`);
  return { success: true, response: { mode: 'development', logged: true } };
}

// Sélectionner le provider d'email
async function sendEmail(email: QueuedEmail): Promise<{ success: boolean; response?: unknown; error?: string }> {
  const provider = process.env.EMAIL_PROVIDER || 'dev';

  switch (provider.toLowerCase()) {
    case 'resend':
      return sendViaResend(email);
    case 'sendgrid':
      return sendViaSendGrid(email);
    case 'dev':
    default:
      return sendViaDev(email);
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.VEILLE_API_SECRET;
    
    if (apiSecret && authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Paramètres
    const body = await request.json().catch(() => ({}));
    const { limit = 10 } = body;

    // Récupérer les emails en attente
    const { data: pendingEmails, error: fetchError } = await supabase
      .from('email_queue')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_at', new Date().toISOString())
      .lt('attempts', 3)
      .order('scheduled_at', { ascending: true })
      .limit(limit);

    if (fetchError) throw fetchError;
    if (!pendingEmails || pendingEmails.length === 0) {
      return NextResponse.json({ message: 'Aucun email en attente', sent: 0, failed: 0 });
    }

    const results = { sent: 0, failed: 0, errors: [] as string[] };

    for (const email of pendingEmails as QueuedEmail[]) {
      // Marquer comme en cours de traitement
      const { data: claimed } = await supabase.rpc('claim_email', { email_id: email.id });

      if (!claimed) {
        // Déjà traité par un autre processus
        continue;
      }

      // Envoyer l'email
      const { success, response, error } = await sendEmail(email);

      if (success) {
        // Marquer comme envoyé
        await supabase.rpc('mark_email_sent', {
          email_id: email.id,
          provider_resp: response ? JSON.stringify(response) : null
        });
        results.sent++;
      } else {
        // Marquer comme échoué
        await supabase.rpc('mark_email_failed', {
          email_id: email.id,
          error_msg: error || 'Erreur inconnue'
        });
        results.failed++;
        results.errors.push(`${email.to_email}: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      provider: process.env.EMAIL_PROVIDER || 'dev',
      ...results
    });

  } catch (error) {
    console.error('Send emails error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/veille/send-emails',
    method: 'POST',
    provider: process.env.EMAIL_PROVIDER || 'dev'
  });
}

