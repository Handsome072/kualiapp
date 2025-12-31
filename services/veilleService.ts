/**
 * Service de veille formation
 * Gestion des sources, items, alertes et règles de veille
 */

import { supabase } from './supabase';
import {
  VeilleSource,
  VeilleItem,
  VeilleKeyword,
  VeilleRule,
  VeilleAlert,
  VeilleSavedItem,
  VeilleFilters,
  VeilleStats,
  VeilleRuleExpression
} from '../types';

// ============================================================================
// SOURCES
// ============================================================================

export async function getSources(): Promise<VeilleSource[]> {
  const { data, error } = await supabase
    .from('veille_sources')
    .select('*')
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
}

export async function getActiveSources(): Promise<VeilleSource[]> {
  const { data, error } = await supabase
    .from('veille_sources')
    .select('*')
    .eq('active', true)
    .order('name');
  
  if (error) throw new Error(error.message);
  return data || [];
}

// ============================================================================
// ITEMS
// ============================================================================

export async function getItems(
  filters: VeilleFilters = {},
  limit = 50,
  offset = 0
): Promise<{ items: VeilleItem[]; total: number }> {
  let query = supabase
    .from('veille_items')
    .select(`
      *,
      veille_sources!inner(name, source_type, metadata)
    `, { count: 'exact' });

  // Appliquer les filtres
  if (filters.source_id) {
    query = query.eq('source_id', filters.source_id);
  }
  if (filters.date_from) {
    query = query.gte('published_at', filters.date_from);
  }
  if (filters.date_to) {
    query = query.lte('published_at', filters.date_to);
  }
  if (filters.theme) {
    query = query.eq('veille_sources.metadata->>category', filters.theme);
  }

  const { data, error, count } = await query
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw new Error(error.message);

  // Transformer les données pour inclure les infos source
  const items: VeilleItem[] = (data || []).map((item: any) => ({
    ...item,
    source_name: item.veille_sources?.name,
    source_type: item.veille_sources?.source_type,
    veille_sources: undefined
  }));

  return { items, total: count || 0 };
}

export async function searchItems(
  query: string,
  limit = 50
): Promise<VeilleItem[]> {
  // Use Algolia for full-text search
  const { searchVeilleItems } = await import('./algoliaService');

  try {
    const { items } = await searchVeilleItems(query, { limit });
    return items;
  } catch (error) {
    console.error('Algolia search failed, falling back to Supabase:', error);

    // Fallback to Supabase text search
    const { data, error: dbError } = await supabase
      .from('veille_items')
      .select(`
        *,
        veille_sources(name, source_type)
      `)
      .or(`title.ilike.%${query}%,summary.ilike.%${query}%`)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (dbError) throw new Error(dbError.message);

    return (data || []).map((item: any) => ({
      ...item,
      source_name: item.veille_sources?.name,
      source_type: item.veille_sources?.source_type
    }));
  }
}

export async function getItemById(id: string): Promise<VeilleItem | null> {
  const { data, error } = await supabase
    .from('veille_items')
    .select(`
      *,
      veille_sources(name, source_type)
    `)
    .eq('id', id)
    .single();

  if (error) return null;
  return {
    ...data,
    source_name: data.veille_sources?.name,
    source_type: data.veille_sources?.source_type
  };
}

// ============================================================================
// SAVED ITEMS (Articles sauvegardés)
// ============================================================================

export async function getSavedItems(userId: string): Promise<VeilleSavedItem[]> {
  const { data, error } = await supabase
    .from('veille_saved_items')
    .select(`
      *,
      veille_items(*, veille_sources(name, source_type))
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return (data || []).map((s: any) => ({
    ...s,
    item: s.veille_items ? {
      ...s.veille_items,
      source_name: s.veille_items.veille_sources?.name
    } : undefined
  }));
}

export async function saveItem(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('veille_saved_items')
    .insert({ user_id: userId, item_id: itemId });
  
  if (error && !error.message.includes('duplicate')) {
    throw new Error(error.message);
  }
}

export async function unsaveItem(userId: string, itemId: string): Promise<void> {
  const { error } = await supabase
    .from('veille_saved_items')
    .delete()
    .eq('user_id', userId)
    .eq('item_id', itemId);

  if (error) throw new Error(error.message);
}

export async function getSavedItemIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('veille_saved_items')
    .select('item_id')
    .eq('user_id', userId);

  if (error) throw new Error(error.message);
  return (data || []).map(s => s.item_id);
}

// ============================================================================
// KEYWORDS (Mots-clés)
// ============================================================================

export async function getKeywords(userId: string): Promise<VeilleKeyword[]> {
  const { data, error } = await supabase
    .from('veille_keywords')
    .select('*')
    .eq('user_id', userId)
    .order('label');

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createKeyword(
  userId: string,
  label: string,
  sensitivity: VeilleKeyword['sensitivity'] = 'normal'
): Promise<VeilleKeyword> {
  const { data, error } = await supabase
    .from('veille_keywords')
    .insert({ user_id: userId, label, sensitivity })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function deleteKeyword(id: string): Promise<void> {
  const { error } = await supabase
    .from('veille_keywords')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// RULES (Règles d'alertes)
// ============================================================================

export async function getRules(userId: string): Promise<VeilleRule[]> {
  const { data, error } = await supabase
    .from('veille_rules')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data || [];
}

export async function createRule(
  userId: string,
  name: string,
  expression: VeilleRuleExpression,
  email?: string
): Promise<VeilleRule> {
  const { data, error } = await supabase
    .from('veille_rules')
    .insert({
      user_id: userId,
      name,
      expression_json: expression,
      notification_email: email,
      notify_digest: true
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateRule(
  id: string,
  updates: Partial<Pick<VeilleRule, 'name' | 'expression_json' | 'notification_email' | 'notify_immediate' | 'notify_digest' | 'active'>>
): Promise<void> {
  const { error } = await supabase
    .from('veille_rules')
    .update(updates)
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function deleteRule(id: string): Promise<void> {
  const { error } = await supabase
    .from('veille_rules')
    .delete()
    .eq('id', id);

  if (error) throw new Error(error.message);
}

// ============================================================================
// ALERTS
// ============================================================================

export async function getAlerts(userId: string, unreadOnly = false): Promise<VeilleAlert[]> {
  let query = supabase
    .from('veille_alerts')
    .select(`
      *,
      veille_rules(name),
      veille_items(title, url)
    `)
    .eq('user_id', userId)
    .order('triggered_at', { ascending: false });

  if (unreadOnly) {
    query = query.is('read_at', null);
  }

  const { data, error } = await query.limit(100);

  if (error) throw new Error(error.message);
  return (data || []).map((a: any) => ({
    ...a,
    rule_name: a.veille_rules?.name,
    item_title: a.veille_items?.title,
    item_url: a.veille_items?.url
  }));
}

export async function markAlertRead(id: string): Promise<void> {
  const { error } = await supabase
    .from('veille_alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}

export async function markAllAlertsRead(userId: string): Promise<void> {
  const { error } = await supabase
    .from('veille_alerts')
    .update({ read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .is('read_at', null);

  if (error) throw new Error(error.message);
}

// ============================================================================
// STATS
// ============================================================================

export async function getStats(userId: string): Promise<VeilleStats> {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalRes,
    todayRes,
    weekRes,
    alertsRes,
    savedRes,
    sourcesRes
  ] = await Promise.all([
    supabase.from('veille_items').select('id', { count: 'exact', head: true }),
    supabase.from('veille_items').select('id', { count: 'exact', head: true }).gte('published_at', todayStart),
    supabase.from('veille_items').select('id', { count: 'exact', head: true }).gte('published_at', weekStart),
    supabase.from('veille_alerts').select('id', { count: 'exact', head: true }).eq('user_id', userId).is('read_at', null),
    supabase.from('veille_saved_items').select('id', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('veille_sources').select('active, last_error')
  ]);

  const sources = sourcesRes.data || [];
  return {
    total_items: totalRes.count || 0,
    items_today: todayRes.count || 0,
    items_this_week: weekRes.count || 0,
    unread_alerts: alertsRes.count || 0,
    saved_count: savedRes.count || 0,
    sources_active: sources.filter((s: any) => s.active && !s.last_error).length,
    sources_error: sources.filter((s: any) => s.last_error).length
  };
}

// ============================================================================
// EXPORT CSV
// ============================================================================

export function exportItemsToCSV(items: VeilleItem[]): string {
  const headers = ['Titre', 'Source', 'URL', 'Date de publication', 'Résumé'];
  const rows = items.map(item => [
    `"${(item.title || '').replace(/"/g, '""')}"`,
    `"${(item.source_name || '').replace(/"/g, '""')}"`,
    item.url || '',
    item.published_at ? new Date(item.published_at).toLocaleDateString('fr-FR') : '',
    `"${(item.summary || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

