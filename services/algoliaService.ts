/**
 * Algolia Search Service for QualiApps Veille
 * Provides full-text search capabilities for veille items
 */

import { algoliasearch, SearchClient } from 'algoliasearch';
import type { VeilleItem } from '../types';

// Algolia configuration
const ALGOLIA_APP_ID = 'FKQZOFADCW';
const ALGOLIA_SEARCH_API_KEY = 'a5c9491c3e1e981475c5022a5d48a6ac';
const ALGOLIA_WRITE_API_KEY = 'e50d3db4fe2c9dc7008a174107eb52da';
const ALGOLIA_INDEX_NAME = 'veille_items';

// Search client (read-only, safe for client-side)
let searchClient: SearchClient | null = null;

// Admin client (write access, server-side only)
let adminClient: SearchClient | null = null;

/**
 * Get the search client (read-only)
 */
export function getSearchClient(): SearchClient {
  if (!searchClient) {
    searchClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
  }
  return searchClient;
}

/**
 * Get the admin client (write access - server-side only)
 */
export function getAdminClient(): SearchClient {
  if (!adminClient) {
    adminClient = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);
  }
  return adminClient;
}

/**
 * Algolia record type for veille items
 */
export interface AlgoliaVeilleRecord {
  objectID: string;
  title: string;
  summary?: string;
  content?: string;
  url: string;
  author?: string;
  published_at?: string;
  source_id: string;
  source_name?: string;
  tags: string[];
  severity?: string;
  impacted_indicators?: number[];
  created_at: string;
}

/**
 * Convert VeilleItem to Algolia record
 */
export function toAlgoliaRecord(item: VeilleItem): AlgoliaVeilleRecord {
  return {
    objectID: item.id,
    title: item.title,
    summary: item.summary,
    content: item.content,
    url: item.url,
    author: item.author,
    published_at: item.published_at,
    source_id: item.source_id,
    source_name: item.source_name,
    tags: item.tags || [],
    severity: item.severity,
    impacted_indicators: item.impacted_indicators,
    created_at: item.created_at,
  };
}

/**
 * Convert Algolia hit to VeilleItem
 */
export function fromAlgoliaHit(hit: AlgoliaVeilleRecord): VeilleItem {
  return {
    id: hit.objectID,
    source_id: hit.source_id,
    title: hit.title,
    summary: hit.summary,
    content: hit.content,
    url: hit.url,
    author: hit.author,
    published_at: hit.published_at,
    source_name: hit.source_name,
    tags: hit.tags || [],
    severity: hit.severity as VeilleItem['severity'],
    impacted_indicators: hit.impacted_indicators,
    fetched_at: hit.created_at,
    created_at: hit.created_at,
  };
}

/**
 * Search veille items using Algolia
 */
export async function searchVeilleItems(
  query: string,
  options: {
    limit?: number;
    filters?: string;
    facetFilters?: string[][];
  } = {}
): Promise<{ items: VeilleItem[]; total: number }> {
  const client = getSearchClient();
  const { limit = 20, filters, facetFilters } = options;

  try {
    const response = await client.searchSingleIndex({
      indexName: ALGOLIA_INDEX_NAME,
      searchParams: {
        query,
        hitsPerPage: limit,
        filters,
        facetFilters,
        attributesToRetrieve: [
          'objectID', 'title', 'summary', 'url', 'author',
          'published_at', 'source_id', 'source_name', 'tags',
          'severity', 'impacted_indicators', 'created_at'
        ],
        attributesToHighlight: ['title', 'summary'],
      },
    });

    const items = response.hits.map((hit) => fromAlgoliaHit(hit as unknown as AlgoliaVeilleRecord));
    
    return {
      items,
      total: response.nbHits || 0,
    };
  } catch (error) {
    console.error('Algolia search error:', error);
    return { items: [], total: 0 };
  }
}

/**
 * Index a single veille item
 */
export async function indexVeilleItem(item: VeilleItem): Promise<void> {
  const client = getAdminClient();
  const record = toAlgoliaRecord(item);
  
  await client.saveObject({
    indexName: ALGOLIA_INDEX_NAME,
    body: record,
  });
}

/**
 * Index multiple veille items in batch
 */
export async function indexVeilleItems(items: VeilleItem[]): Promise<{ indexed: number }> {
  if (items.length === 0) return { indexed: 0 };
  
  const client = getAdminClient();
  const records = items.map(toAlgoliaRecord);
  
  await client.saveObjects({
    indexName: ALGOLIA_INDEX_NAME,
    objects: records as unknown as Record<string, unknown>[],
  });
  
  return { indexed: records.length };
}

/**
 * Delete a veille item from the index
 */
export async function deleteVeilleItem(itemId: string): Promise<void> {
  const client = getAdminClient();
  
  await client.deleteObject({
    indexName: ALGOLIA_INDEX_NAME,
    objectID: itemId,
  });
}

/**
 * Configure the Algolia index settings
 */
export async function configureIndex(): Promise<void> {
  const client = getAdminClient();
  
  await client.setSettings({
    indexName: ALGOLIA_INDEX_NAME,
    indexSettings: {
      searchableAttributes: [
        'title',
        'summary',
        'content',
        'tags',
        'author',
        'source_name',
      ],
      attributesForFaceting: [
        'filterOnly(source_id)',
        'filterOnly(severity)',
        'searchable(tags)',
      ],
      ranking: [
        'desc(published_at)',
        'typo',
        'geo',
        'words',
        'filters',
        'proximity',
        'attribute',
        'exact',
        'custom',
      ],
      customRanking: ['desc(published_at)'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    },
  });
}

export { ALGOLIA_INDEX_NAME };

