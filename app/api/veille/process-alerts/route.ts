/**
 * API Route: /api/veille/process-alerts
 * 
 * Matche les nouveaux items de veille avec les règles utilisateur
 * et crée les alertes + ajoute à la queue d'emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface VeilleRule {
  id: string;
  user_id: string;
  name: string;
  expression_json: {
    operator: 'AND' | 'OR' | 'NOT';
    terms: string[];
    not_terms?: string[];
  };
  notification_email?: string;
  notify_immediate: boolean;
  notify_digest: boolean;
}

interface VeilleItem {
  id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  source_name?: string;
}

// Vérifie si un item match une règle
function matchesRule(item: VeilleItem, rule: VeilleRule): boolean {
  const content = `${item.title} ${item.summary || ''} ${item.content || ''}`.toLowerCase();
  const { operator, terms, not_terms } = rule.expression_json;

  // Vérifier les termes exclus
  if (not_terms && not_terms.length > 0) {
    for (const term of not_terms) {
      if (content.includes(term.toLowerCase())) {
        return false;
      }
    }
  }

  // Vérifier les termes principaux
  if (operator === 'AND') {
    return terms.every(term => content.includes(term.toLowerCase()));
  } else if (operator === 'OR') {
    return terms.some(term => content.includes(term.toLowerCase()));
  } else if (operator === 'NOT') {
    return !terms.some(term => content.includes(term.toLowerCase()));
  }

  return false;
}

// Générer le HTML de l'email
function generateEmailHtml(items: VeilleItem[], ruleName: string): string {
  const itemsHtml = items.map(item => `
    <li style="margin-bottom: 16px; padding: 12px; background: #f8fafc; border-radius: 8px;">
      <a href="${item.url}" style="color: #2563eb; font-weight: bold; text-decoration: none;">
        ${item.title}
      </a>
      ${item.summary ? `<p style="margin: 8px 0 0; color: #64748b; font-size: 14px;">${item.summary.substring(0, 200)}...</p>` : ''}
      ${item.source_name ? `<p style="margin: 4px 0 0; color: #94a3b8; font-size: 12px;">Source: ${item.source_name}</p>` : ''}
    </li>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 24px; border-radius: 12px; color: white; margin-bottom: 24px;">
        <h1 style="margin: 0; font-size: 24px;">🔔 Alerte Veille Qualiopi</h1>
        <p style="margin: 8px 0 0; opacity: 0.9;">Règle déclenchée: ${ruleName}</p>
      </div>
      
      <h2 style="color: #1e293b; font-size: 18px;">${items.length} nouvel(s) article(s) détecté(s)</h2>
      
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${itemsHtml}
      </ul>
      
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 24px 0;">
      
      <p style="color: #94a3b8; font-size: 12px; text-align: center;">
        QualiApps - Veille Formation Professionnelle
      </p>
    </body>
    </html>
  `;
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
    const { mode = 'immediate', since_hours = 1 } = body;
    
    const sinceDate = new Date(Date.now() - since_hours * 60 * 60 * 1000).toISOString();

    // Récupérer les items récents
    const { data: recentItems, error: itemsError } = await supabase
      .from('veille_items')
      .select('*, veille_sources(name)')
      .gte('fetched_at', sinceDate)
      .order('fetched_at', { ascending: false });

    if (itemsError) throw itemsError;
    if (!recentItems || recentItems.length === 0) {
      return NextResponse.json({ message: 'Aucun nouvel item', alerts_created: 0 });
    }

    // Enrichir les items
    const items: VeilleItem[] = recentItems.map((item: Record<string, unknown>) => ({
      id: item.id as string,
      title: item.title as string,
      summary: item.summary as string | undefined,
      content: item.content as string | undefined,
      url: item.url as string,
      source_name: (item.veille_sources as { name: string } | null)?.name
    }));

    // Récupérer les règles actives
    const { data: rules, error: rulesError } = await supabase
      .from('veille_rules')
      .select('*')
      .eq('active', true);

    if (rulesError) throw rulesError;
    if (!rules || rules.length === 0) {
      return NextResponse.json({ message: 'Aucune règle active', alerts_created: 0 });
    }

    const results = { alerts_created: 0, emails_queued: 0, rules_matched: 0 };

    // Grouper les alertes par règle pour les emails
    const ruleAlerts: Map<string, { rule: VeilleRule; items: VeilleItem[] }> = new Map();

    // Pour chaque règle, vérifier les items
    for (const rule of rules as VeilleRule[]) {
      const matchedItems = items.filter(item => matchesRule(item, rule));

      if (matchedItems.length === 0) continue;

      results.rules_matched++;

      for (const item of matchedItems) {
        // Vérifier si l'alerte existe déjà
        const { data: existingAlert } = await supabase
          .from('veille_alerts')
          .select('id')
          .eq('rule_id', rule.id)
          .eq('item_id', item.id)
          .single();

        if (!existingAlert) {
          // Créer l'alerte
          const { error: alertError } = await supabase
            .from('veille_alerts')
            .insert({
              rule_id: rule.id,
              item_id: item.id,
              user_id: rule.user_id,
              delivery_method: mode === 'digest' ? 'digest' : 'email'
            });

          if (!alertError) {
            results.alerts_created++;

            // Grouper pour l'email
            if (rule.notification_email) {
              if (!ruleAlerts.has(rule.id)) {
                ruleAlerts.set(rule.id, { rule, items: [] });
              }
              ruleAlerts.get(rule.id)!.items.push(item);
            }
          }
        }
      }
    }

    // Créer les entrées dans la queue d'emails
    for (const [, { rule, items: alertItems }] of ruleAlerts) {
      if (rule.notification_email && alertItems.length > 0) {
        const subject = mode === 'digest'
          ? `[QualiApps] Digest Veille - ${alertItems.length} nouveaux articles`
          : `[QualiApps] Alerte: ${alertItems[0].title.substring(0, 50)}...`;

        const htmlContent = generateEmailHtml(alertItems, rule.name);

        // Ajouter à la queue d'emails
        const { error: queueError } = await supabase
          .from('email_queue')
          .insert({
            to_email: rule.notification_email,
            subject,
            html_content: htmlContent,
            metadata: {
              rule_id: rule.id,
              rule_name: rule.name,
              item_count: alertItems.length,
              item_ids: alertItems.map(i => i.id)
            }
          });

        if (!queueError) {
          results.emails_queued++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      mode,
      items_processed: items.length,
      ...results
    });

  } catch (error) {
    console.error('Process alerts error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/veille/process-alerts',
    method: 'POST'
  });
}

