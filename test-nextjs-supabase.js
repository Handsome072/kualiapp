// Test script pour vérifier la configuration Next.js + Supabase
// Run with: node test-nextjs-supabase.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔍 Test de Configuration Next.js + Supabase\n');
console.log('='.repeat(60));

// Lire le fichier .env.local
let envContent;
try {
  envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
  console.log('✓ Fichier .env.local trouvé\n');
} catch (error) {
  console.log('✗ Fichier .env.local non trouvé');
  process.exit(1);
}

// Parser les variables d'environnement
const envVars = {};
envContent.split('\n').forEach(line => {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join('=').trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

console.log('📋 Variables d\'environnement:');
console.log('-'.repeat(60));
console.log(`NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl || '❌ MANQUANT'}`);
console.log(`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY: ${supabaseKey ? '✓ Présent' : '❌ MANQUANT'}`);

if (supabaseKey) {
  console.log(`  Longueur: ${supabaseKey.length} caractères`);
  console.log(`  Commence par: ${supabaseKey.substring(0, 30)}...`);
  
  // Vérifier le format JWT
  if (supabaseKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.')) {
    console.log('  Format: ✓ JWT valide');
  } else if (supabaseKey === 'VOTRE_JWT_TOKEN_ICI_A_REMPLACER') {
    console.log('  Format: ❌ PLACEHOLDER - Vous devez le remplacer par votre vrai JWT token!');
    console.log('\n⚠️  ERREUR: Le JWT token n\'a pas été configuré!');
    console.log('📖 Consultez OBTENIR-JWT-TOKEN.md pour obtenir votre token\n');
    process.exit(1);
  } else {
    console.log('  Format: ⚠️  Ne ressemble pas à un JWT token valide');
  }
}

console.log('\n' + '='.repeat(60));

if (!supabaseUrl || !supabaseKey) {
  console.log('\n❌ Configuration incomplète. Vérifiez votre fichier .env.local\n');
  process.exit(1);
}

// Tester la connexion Supabase
console.log('\n🔌 Test de connexion Supabase...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    // Test 1: Vérifier la session
    console.log('Test 1: Vérification de session...');
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log(`  ✗ Erreur: ${sessionError.message}`);
      return false;
    }
    console.log(`  ✓ Session check OK (${session ? 'Connecté' : 'Non connecté'})`);

    // Test 2: Vérifier l'accès à la base de données
    console.log('\nTest 2: Vérification des tables...');
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);

    if (error) {
      if (error.message.includes('relation "public.profiles" does not exist')) {
        console.log('  ⚠️  Tables non créées');
        console.log('  📖 Exécutez supabase-schema.sql dans l\'éditeur SQL Supabase');
        console.log('  👉 https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new');
        return false;
      } else if (error.message.includes('Invalid API key')) {
        console.log('  ✗ JWT token invalide');
        console.log('  📖 Vérifiez que vous avez copié la bonne clé "anon public"');
        return false;
      } else {
        console.log(`  ✗ Erreur: ${error.message}`);
        return false;
      }
    }
    console.log('  ✓ Tables accessibles');

    // Test 3: Vérifier les autres tables
    console.log('\nTest 3: Vérification de toutes les tables...');
    const tables = ['profiles', 'reports', 'non_conformities', 'documents', 'audit_states'];
    let allTablesExist = true;

    for (const table of tables) {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`  ✗ ${table}: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`  ✓ ${table}`);
      }
    }

    if (!allTablesExist) {
      console.log('\n  ⚠️  Certaines tables sont manquantes');
      console.log('  📖 Exécutez supabase-schema.sql dans l\'éditeur SQL Supabase');
      return false;
    }

    return true;
  } catch (error) {
    console.log(`\n✗ Erreur inattendue: ${error.message}`);
    return false;
  }
}

testConnection().then(success => {
  console.log('\n' + '='.repeat(60));
  if (success) {
    console.log('\n✅ CONFIGURATION COMPLÈTE ET FONCTIONNELLE!\n');
    console.log('🚀 Prochaines étapes:');
    console.log('   1. Démarrez le serveur: npm run dev');
    console.log('   2. Ouvrez http://localhost:3000');
    console.log('   3. Testez l\'inscription et la connexion\n');
  } else {
    console.log('\n⚠️  CONFIGURATION INCOMPLÈTE\n');
    console.log('📖 Consultez CONFIGURATION-COMPLETE.md pour les étapes suivantes\n');
  }
  console.log('='.repeat(60) + '\n');
});

