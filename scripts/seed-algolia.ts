/**
 * Script to seed Algolia with demo veille items
 * Run with: npx tsx scripts/seed-algolia.ts
 */

import { algoliasearch } from 'algoliasearch';

const ALGOLIA_APP_ID = 'FKQZOFADCW';
const ALGOLIA_WRITE_API_KEY = 'e50d3db4fe2c9dc7008a174107eb52da';
const ALGOLIA_INDEX_NAME = 'veille_items';

const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_WRITE_API_KEY);

// Demo veille items for testing search
const demoItems = [
  {
    objectID: 'demo-1',
    title: 'Nouvelle réglementation Qualiopi 2025 : les changements majeurs',
    summary: 'Le référentiel national qualité évolue avec de nouvelles exigences pour les organismes de formation. Découvrez les principaux changements à anticiper pour votre certification Qualiopi.',
    url: 'https://example.com/qualiopi-2025',
    author: 'Ministère du Travail',
    published_at: new Date().toISOString(),
    source_id: 'source-1',
    source_name: 'France Compétences',
    tags: ['Qualiopi', 'Certification', 'Formation professionnelle', '2025'],
    severity: 'alerte',
    impacted_indicators: [1, 2, 3],
    created_at: new Date().toISOString(),
  },
  {
    objectID: 'demo-2',
    title: 'CPF : nouvelles règles de financement pour 2025',
    summary: 'Les modalités de financement du Compte Personnel de Formation évoluent. Impact sur les organismes de formation et les apprenants.',
    url: 'https://example.com/cpf-2025',
    author: 'Caisse des Dépôts',
    published_at: new Date(Date.now() - 86400000).toISOString(),
    source_id: 'source-2',
    source_name: 'Caisse des Dépôts',
    tags: ['CPF', 'Financement', 'Formation'],
    severity: 'info',
    impacted_indicators: [7, 8],
    created_at: new Date().toISOString(),
  },
  {
    objectID: 'demo-3',
    title: 'Apprentissage : nouvelles modalités de contrôle pédagogique',
    summary: 'Les CFA doivent se conformer aux nouvelles exigences de suivi pédagogique des apprentis. Guide pratique pour la mise en conformité.',
    url: 'https://example.com/apprentissage-controle',
    author: 'DREETS',
    published_at: new Date(Date.now() - 172800000).toISOString(),
    source_id: 'source-1',
    source_name: 'France Compétences',
    tags: ['Apprentissage', 'CFA', 'Pédagogie', 'Contrôle'],
    severity: 'critique',
    impacted_indicators: [11, 12, 13, 14],
    created_at: new Date().toISOString(),
  },
  {
    objectID: 'demo-4',
    title: 'RNCP : mise à jour des fiches et nouvelles procédures',
    summary: 'France Compétences annonce des évolutions majeures dans la gestion des certifications RNCP. Calendrier et modalités de transition.',
    url: 'https://example.com/rncp-update',
    author: 'France Compétences',
    published_at: new Date(Date.now() - 259200000).toISOString(),
    source_id: 'source-1',
    source_name: 'France Compétences',
    tags: ['RNCP', 'Certification', 'France Compétences'],
    severity: 'alerte',
    impacted_indicators: [4, 5, 6],
    created_at: new Date().toISOString(),
  },
  {
    objectID: 'demo-5',
    title: 'Accessibilité des formations : nouvelles obligations légales',
    summary: 'Les organismes de formation doivent renforcer leur politique d\'accessibilité. Référentiel et outils de mise en conformité.',
    url: 'https://example.com/accessibilite',
    author: 'Agefiph',
    published_at: new Date(Date.now() - 345600000).toISOString(),
    source_id: 'source-3',
    source_name: 'Agefiph',
    tags: ['Accessibilité', 'Handicap', 'Inclusion'],
    severity: 'info',
    impacted_indicators: [26],
    created_at: new Date().toISOString(),
  },
  {
    objectID: 'demo-6',
    title: 'Réforme de la VAE : simplification des parcours',
    summary: 'La validation des acquis de l\'expérience évolue avec des parcours simplifiés et un meilleur accompagnement des candidats.',
    url: 'https://example.com/vae-reforme',
    author: 'Ministère du Travail',
    published_at: new Date(Date.now() - 432000000).toISOString(),
    source_id: 'source-2',
    source_name: 'Légifrance',
    tags: ['VAE', 'Certification', 'Réforme'],
    severity: 'info',
    impacted_indicators: [17, 18],
    created_at: new Date().toISOString(),
  },
];

async function seedAlgolia() {
  console.log('🔍 Configuring Algolia index settings...');
  
  // Configure index settings
  await client.setSettings({
    indexName: ALGOLIA_INDEX_NAME,
    indexSettings: {
      searchableAttributes: ['title', 'summary', 'tags', 'author', 'source_name'],
      attributesForFaceting: ['filterOnly(source_id)', 'filterOnly(severity)', 'searchable(tags)'],
      customRanking: ['desc(published_at)'],
      highlightPreTag: '<mark>',
      highlightPostTag: '</mark>',
    },
  });

  console.log('📝 Indexing demo items...');
  
  // Index demo items
  await client.saveObjects({
    indexName: ALGOLIA_INDEX_NAME,
    objects: demoItems,
  });

  console.log(`✅ Successfully indexed ${demoItems.length} demo items to Algolia`);
  console.log(`📊 Index: ${ALGOLIA_INDEX_NAME}`);
  console.log('\nYou can now search for:');
  console.log('  - "Qualiopi" - Find Qualiopi-related articles');
  console.log('  - "CPF" - Find CPF funding articles');
  console.log('  - "apprentissage" - Find apprenticeship articles');
  console.log('  - "RNCP" - Find certification articles');
  console.log('  - "accessibilité" - Find accessibility articles');
}

seedAlgolia().catch(console.error);

