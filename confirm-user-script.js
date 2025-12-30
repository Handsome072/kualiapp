// Script pour confirmer manuellement un utilisateur Supabase
// Run with: node confirm-user-script.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🔧 Script de Confirmation Manuelle d\'Utilisateur\n');
console.log('='.repeat(60));

// Lire le fichier .env.local
let envContent;
try {
  envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
} catch (error) {
  console.log('❌ Fichier .env.local non trouvé');
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

console.log('\n📋 Configuration:');
console.log(`   URL: ${supabaseUrl}`);
console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function confirmUser(email) {
  console.log(`\n🔍 Recherche de l'utilisateur: ${email}\n`);
  
  try {
    // Vérifier si l'utilisateur existe
    const { data: users, error: fetchError } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', email);
    
    if (fetchError) {
      console.log('⚠️  Impossible de vérifier via la table (normal avec RLS)');
      console.log('   Utilisez plutôt le SQL Editor ou le Dashboard Supabase\n');
    }
    
    console.log('📝 INSTRUCTIONS POUR CONFIRMER L\'UTILISATEUR:\n');
    console.log('Option 1: Via le Dashboard Supabase (Recommandé)');
    console.log('─'.repeat(60));
    console.log('1. Ouvrez: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/auth/users');
    console.log(`2. Trouvez l'utilisateur: ${email}`);
    console.log('3. Cliquez sur les 3 points (⋮) à droite');
    console.log('4. Sélectionnez "Confirm user"');
    console.log('5. Testez la connexion\n');
    
    console.log('Option 2: Via SQL Editor');
    console.log('─'.repeat(60));
    console.log('1. Ouvrez: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new');
    console.log('2. Exécutez cette requête SQL:\n');
    console.log('```sql');
    console.log('-- Vérifier l\'utilisateur');
    console.log('SELECT id, email, email_confirmed_at, created_at');
    console.log('FROM auth.users');
    console.log(`WHERE email = '${email}';`);
    console.log('');
    console.log('-- Confirmer l\'utilisateur');
    console.log('UPDATE auth.users');
    console.log('SET email_confirmed_at = NOW()');
    console.log(`WHERE email = '${email}';`);
    console.log('```\n');
    
    console.log('Option 3: Désactiver la Confirmation Email (Pour éviter ce problème)');
    console.log('─'.repeat(60));
    console.log('1. Ouvrez: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/auth/providers');
    console.log('2. Cliquez sur "Email"');
    console.log('3. Décochez "Confirm email"');
    console.log('4. Sauvegardez');
    console.log('5. Les nouveaux utilisateurs seront automatiquement confirmés\n');
    
  } catch (error) {
    console.log(`\n❌ Erreur: ${error.message}\n`);
  }
}

async function testLogin(email, password) {
  console.log(`\n🔐 Test de Connexion\n`);
  console.log(`   Email: ${email}`);
  console.log(`   Password: ${'*'.repeat(password.length)}\n`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      console.log('❌ Connexion échouée:');
      console.log(`   ${error.message}\n`);
      
      if (error.message.includes('Invalid') || error.message.includes('credentials')) {
        console.log('💡 Raisons possibles:');
        console.log('   1. L\'email n\'est pas confirmé (le plus probable)');
        console.log('   2. Le mot de passe est incorrect');
        console.log('   3. L\'utilisateur n\'existe pas\n');
        console.log('👉 Confirmez l\'utilisateur avec les instructions ci-dessus\n');
      }
      
      return false;
    }
    
    console.log('✅ Connexion réussie!');
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Confirmé: ${data.user?.email_confirmed_at ? '✅ OUI' : '❌ NON'}\n`);
    
    // Déconnexion
    await supabase.auth.signOut();
    
    return true;
  } catch (error) {
    console.log(`\n❌ Erreur inattendue: ${error.message}\n`);
    return false;
  }
}

// Exécution
const email = 'quali@gmail.com';
const password = '123456789';

console.log('\n' + '='.repeat(60));

confirmUser(email).then(() => {
  console.log('='.repeat(60));
  return testLogin(email, password);
}).then(success => {
  console.log('='.repeat(60));
  
  if (success) {
    console.log('\n✅ L\'utilisateur est confirmé et peut se connecter!\n');
  } else {
    console.log('\n⚠️  L\'utilisateur doit être confirmé manuellement\n');
    console.log('📖 Suivez les instructions ci-dessus pour confirmer l\'utilisateur\n');
  }
  
  console.log('='.repeat(60) + '\n');
});

