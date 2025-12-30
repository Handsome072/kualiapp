/**
 * API Route: /api/veille/fetch-sources
 * 
 * Collecte les articles depuis les sources RSS/Atom/HTML configurées
 * Remplace l'Edge Function Supabase fetch-veille-sources
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Types
interface VeilleSource {
  id: string;
  name: string;
  url: string;
  source_type: 'rss' | 'atom' | 'html';
  css_selector?: string;
  metadata?: Record<string, unknown>;
}

interface ParsedItem {
  external_id: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  author?: string;
  published_at?: string;
  image_url?: string;
  tags: string[];
}

// Parser RSS/Atom simple
function parseRSSFeed(xmlText: string): ParsedItem[] {
  const items: ParsedItem[] = [];
  
  const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
  const entryRegex = /<entry[^>]*>([\s\S]*?)<\/entry>/gi;
  
  const extractTag = (xml: string, tag: string): string => {
    const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].replace(/<!\[CDATA\[|\]\]>/g, '').trim() : '';
  };

  const extractAttr = (xml: string, tag: string, attr: string): string => {
    const regex = new RegExp(`<${tag}[^>]*${attr}="([^"]*)"`, 'i');
    const match = xml.match(regex);
    return match ? match[1] : '';
  };

  // Essayer RSS d'abord
  let matches = [...xmlText.matchAll(itemRegex)];
  
  // Si pas d'items RSS, essayer Atom
  if (matches.length === 0) {
    matches = [...xmlText.matchAll(entryRegex)];
  }

  for (const match of matches) {
    const itemXml = match[1];
    
    const title = extractTag(itemXml, 'title');
    const link = extractTag(itemXml, 'link') || extractAttr(itemXml, 'link', 'href');
    const description = extractTag(itemXml, 'description') || extractTag(itemXml, 'summary') || extractTag(itemXml, 'content');
    const pubDate = extractTag(itemXml, 'pubDate') || extractTag(itemXml, 'published') || extractTag(itemXml, 'updated');
    const guid = extractTag(itemXml, 'guid') || extractTag(itemXml, 'id') || link;
    const author = extractTag(itemXml, 'author') || extractTag(itemXml, 'dc:creator');

    if (title && link) {
      items.push({
        external_id: guid || `${link}-${Date.now()}`,
        title: title.substring(0, 500),
        summary: description?.substring(0, 2000),
        url: link,
        author: author?.substring(0, 200),
        published_at: pubDate ? new Date(pubDate).toISOString() : undefined,
        tags: []
      });
    }
  }

  return items;
}

// Fetch et parse une source
async function fetchSource(source: VeilleSource): Promise<{ items: ParsedItem[]; error?: string }> {
  try {
    const response = await fetch(source.url, {
      headers: {
        'User-Agent': 'QualiApps-Veille/1.0 (Formation professionnelle)',
        'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
      },
      next: { revalidate: 0 } // Pas de cache
    });

    if (!response.ok) {
      return { items: [], error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const text = await response.text();

    if (source.source_type === 'rss' || source.source_type === 'atom') {
      const items = parseRSSFeed(text);
      return { items };
    }

    // HTML scraping basique
    if (source.source_type === 'html') {
      return { 
        items: [{
          external_id: `html-${source.id}-${Date.now()}`,
          title: `Mise à jour de ${source.name}`,
          summary: 'Nouvelle mise à jour détectée sur la source HTML',
          url: source.url,
          published_at: new Date().toISOString(),
          tags: ['html-update']
        }]
      };
    }

    return { items: [] };
  } catch (error) {
    return { items: [], error: error instanceof Error ? error.message : 'Erreur inconnue' };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel: ajouter un token secret)
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.VEILLE_API_SECRET;
    
    if (apiSecret && authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Initialiser Supabase avec service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Récupérer les sources actives
    const { data: sources, error: sourcesError } = await supabase
      .from('veille_sources')
      .select('*')
      .eq('active', true);

    if (sourcesError) throw sourcesError;
    if (!sources || sources.length === 0) {
      return NextResponse.json({ message: 'Aucune source active', processed: 0 });
    }

    const results = { processed: 0, inserted: 0, errors: [] as string[] };

    for (const source of sources) {
      results.processed++;

      const { items, error } = await fetchSource(source as VeilleSource);

      if (error) {
        results.errors.push(`${source.name}: ${error}`);
        await supabase.from('veille_sources').update({
          last_error: error,
          last_fetched_at: new Date().toISOString()
        }).eq('id', source.id);
        continue;
      }

      // Insérer les nouveaux items
      for (const item of items) {
        const { error: insertError } = await supabase
          .from('veille_items')
          .upsert({
            source_id: source.id,
            external_id: item.external_id,
            title: item.title,
            summary: item.summary,
            content: item.content,
            url: item.url,
            author: item.author,
            published_at: item.published_at,
            image_url: item.image_url,
            tags: item.tags,
            fetched_at: new Date().toISOString()
          }, {
            onConflict: 'source_id,external_id',
            ignoreDuplicates: true
          });

        if (!insertError) {
          results.inserted++;
        }
      }

      // Mettre à jour la source
      await supabase.from('veille_sources').update({
        last_error: null,
        last_fetched_at: new Date().toISOString()
      }).eq('id', source.id);
    }

    return NextResponse.json({
      success: true,
      message: 'Synchronisation terminée',
      ...results
    });

  } catch (error) {
    console.error('Fetch veille error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    }, { status: 500 });
  }
}

// GET pour vérifier le statut
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/veille/fetch-sources',
    method: 'POST'
  });
}

