// Script pour tester la connexion après avoir confirmé l'utilisateur
// Run with: node test-login-after-fix.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🧪 Test de Connexion - quali@gmail.com\n');
console.log('='.repeat(70));

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

const supabase = createClient(supabaseUrl, supabaseKey);

const TEST_EMAIL = 'quali@gmail.com';
const TEST_PASSWORD = '123456789';

async function testLogin() {
  console.log('\n🔐 Tentative de Connexion\n');
  console.log(`   Email: ${TEST_EMAIL}`);
  console.log(`   Password: ${'*'.repeat(TEST_PASSWORD.length)}\n`);
  
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD
    });
    
    if (error) {
      console.log('❌ CONNEXION ÉCHOUÉE\n');
      console.log(`   Erreur: ${error.message}`);
      console.log(`   Status: ${error.status || 'N/A'}\n`);
      
      if (error.message.includes('Invalid login credentials')) {
        console.log('💡 DIAGNOSTIC:\n');
        console.log('   Raisons possibles:');
        console.log('   1. L\'utilisateur n\'est toujours pas confirmé');
        console.log('   2. Le mot de passe est incorrect');
        console.log('   3. L\'utilisateur n\'existe pas\n');
        
        console.log('🔧 SOLUTIONS:\n');
        console.log('   Option 1: Vérifier que le SQL a été exécuté');
        console.log('   ─────────────────────────────────────────────');
        console.log('   1. Ouvrez: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new');
        console.log('   2. Exécutez:');
        console.log('      SELECT email, email_confirmed_at');
        console.log('      FROM auth.users');
        console.log(`      WHERE email = '${TEST_EMAIL}';`);
        console.log('   3. Vérifiez que email_confirmed_at a une date\n');
        
        console.log('   Option 2: Confirmer l\'utilisateur');
        console.log('   ─────────────────────────────────────────────');
        console.log('   1. Ouvrez: https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new');
        console.log('   2. Exécutez:');
        console.log('      UPDATE auth.users');
        console.log('      SET email_confirmed_at = NOW()');
        console.log(`      WHERE email = '${TEST_EMAIL}';`);
        console.log('   3. Relancez ce script\n');
        
        console.log('   Option 3: Supprimer et recréer');
        console.log('   ─────────────────────────────────────────────');
        console.log('   1. Désactivez la confirmation email:');
        console.log('      https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/auth/providers');
        console.log('   2. Supprimez l\'utilisateur (SQL):');
        console.log(`      DELETE FROM auth.users WHERE email = '${TEST_EMAIL}';`);
        console.log('   3. Créez un nouveau compte sur http://localhost:3000/signup\n');
      } else if (error.message.includes('Email not confirmed')) {
        console.log('💡 L\'utilisateur existe mais n\'est PAS confirmé\n');
        console.log('🔧 SOLUTION:\n');
        console.log('   Exécutez ce SQL:');
        console.log('   UPDATE auth.users');
        console.log('   SET email_confirmed_at = NOW()');
        console.log(`   WHERE email = '${TEST_EMAIL}';\n`);
      }
      
      return false;
    }
    
    console.log('✅ CONNEXION RÉUSSIE!\n');
    console.log('📊 Informations Utilisateur:');
    console.log(`   User ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Email confirmé: ${data.user?.email_confirmed_at ? '✅ OUI' : '❌ NON'}`);
    console.log(`   Date de confirmation: ${data.user?.email_confirmed_at || 'N/A'}`);
    console.log(`   Créé le: ${data.user?.created_at}`);
    console.log(`   Dernière connexion: ${data.user?.last_sign_in_at || 'Jamais'}\n`);
    
    console.log('🎉 SUCCÈS!\n');
    console.log('   Vous pouvez maintenant vous connecter sur:');
    console.log('   👉 http://localhost:3000/login\n');
    console.log('   Identifiants:');
    console.log(`   - Email: ${TEST_EMAIL}`);
    console.log(`   - Password: ${TEST_PASSWORD}\n`);
    
    // Déconnexion
    await supabase.auth.signOut();
    
    return true;
  } catch (err) {
    console.log(`\n❌ Erreur inattendue: ${err.message}\n`);
    return false;
  }
}

console.log('\n' + '='.repeat(70));

testLogin().then(success => {
  console.log('='.repeat(70));
  
  if (success) {
    console.log('\n✅ TEST RÉUSSI - L\'authentification fonctionne!\n');
  } else {
    console.log('\n⚠️  TEST ÉCHOUÉ - Suivez les instructions ci-dessus\n');
  }
  
  console.log('='.repeat(70) + '\n');
});

