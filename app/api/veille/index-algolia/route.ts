/**
 * API Route: Index Veille Items to Algolia
 * POST /api/veille/index-algolia
 * 
 * This endpoint fetches all veille items from Supabase and indexes them to Algolia
 * for full-text search capabilities.
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { 
  indexVeilleItems, 
  configureIndex,
  ALGOLIA_INDEX_NAME 
} from '@/services/algoliaService';
import type { VeilleItem } from '@/types';

// Create Supabase client with service role for admin access
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    // Optional: Verify API secret for security
    const authHeader = request.headers.get('authorization');
    const apiSecret = process.env.VEILLE_API_SECRET;
    
    if (apiSecret && authHeader !== `Bearer ${apiSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body for options
    let options: { configureSettings?: boolean; batchSize?: number } = {};
    try {
      options = await request.json();
    } catch {
      // No body provided, use defaults
    }

    const { configureSettings = true, batchSize = 100 } = options;

    // Step 1: Configure Algolia index settings if requested
    if (configureSettings) {
      console.log('[Algolia] Configuring index settings...');
      await configureIndex();
      console.log('[Algolia] Index settings configured');
    }

    // Step 2: Fetch all veille items from Supabase
    console.log('[Algolia] Fetching veille items from Supabase...');
    
    let allItems: VeilleItem[] = [];
    let offset = 0;
    let hasMore = true;

    while (hasMore) {
      const { data, error } = await supabase
        .from('veille_items')
        .select(`
          *,
          veille_sources(name, source_type)
        `)
        .order('published_at', { ascending: false })
        .range(offset, offset + batchSize - 1);

      if (error) {
        console.error('[Algolia] Error fetching items:', error);
        throw new Error(`Failed to fetch items: ${error.message}`);
      }

      if (!data || data.length === 0) {
        hasMore = false;
      } else {
        // Transform items with source info
        const items = data.map((item: any) => ({
          ...item,
          source_name: item.veille_sources?.name,
          source_type: item.veille_sources?.source_type,
        }));
        
        allItems = [...allItems, ...items];
        offset += batchSize;
        
        // Stop if we got fewer items than requested (end of data)
        if (data.length < batchSize) {
          hasMore = false;
        }
      }
    }

    console.log(`[Algolia] Fetched ${allItems.length} items from Supabase`);

    if (allItems.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No items to index',
        indexed: 0,
        index: ALGOLIA_INDEX_NAME,
      });
    }

    // Step 3: Index items to Algolia in batches
    console.log('[Algolia] Indexing items to Algolia...');
    
    let totalIndexed = 0;
    for (let i = 0; i < allItems.length; i += batchSize) {
      const batch = allItems.slice(i, i + batchSize);
      const { indexed } = await indexVeilleItems(batch);
      totalIndexed += indexed;
      console.log(`[Algolia] Indexed batch ${Math.floor(i / batchSize) + 1}: ${indexed} items`);
    }

    console.log(`[Algolia] Successfully indexed ${totalIndexed} items`);

    return NextResponse.json({
      success: true,
      message: `Successfully indexed ${totalIndexed} veille items to Algolia`,
      indexed: totalIndexed,
      index: ALGOLIA_INDEX_NAME,
    });

  } catch (error) {
    console.error('[Algolia] Indexing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to index items to Algolia',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET method to check index status
export async function GET() {
  return NextResponse.json({
    index: ALGOLIA_INDEX_NAME,
    endpoints: {
      POST: 'Index all veille items to Algolia',
    },
    options: {
      configureSettings: 'boolean - Configure index settings (default: true)',
      batchSize: 'number - Batch size for fetching/indexing (default: 100)',
    },
  });
}

