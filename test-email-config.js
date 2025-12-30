// Script de test pour diagnostiquer les problèmes d'email Supabase
// Run with: node test-email-config.js

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('📧 Test de Configuration Email Supabase\n');
console.log('='.repeat(60));

// Lire le fichier .env.local
let envContent;
try {
  envContent = readFileSync(join(__dirname, '.env.local'), 'utf-8');
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function testEmailConfig() {
  console.log('\n🔍 Test 1: Tentative d\'inscription avec email de test\n');
  
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'Test123456!';
  
  console.log(`Email de test: ${testEmail}`);
  console.log(`Mot de passe: ${testPassword}\n`);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: 'http://localhost:3000/dashboard'
      }
    });
    
    if (error) {
      console.log('❌ ERREUR lors de l\'inscription:\n');
      console.log(`   Message: ${error.message}`);
      console.log(`   Status: ${error.status || 'N/A'}`);
      
      if (error.message.includes('email') || error.message.includes('Error sending')) {
        console.log('\n📧 DIAGNOSTIC:');
        console.log('   ⚠️  Problème d\'envoi d\'email détecté!');
        console.log('\n💡 SOLUTIONS:');
        console.log('   1. Désactiver la confirmation email dans Supabase:');
        console.log('      👉 https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/auth/providers');
        console.log('      - Cliquez sur "Email"');
        console.log('      - Décochez "Confirm email"');
        console.log('      - Sauvegardez');
        console.log('\n   2. Ou configurez un service SMTP personnalisé:');
        console.log('      👉 https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/settings/auth');
        console.log('      - Scrollez jusqu\'à "SMTP Settings"');
        console.log('      - Configurez votre service (SendGrid, Mailgun, etc.)');
      }
      
      return false;
    }
    
    console.log('✅ Inscription réussie!\n');
    console.log('📊 Détails de l\'utilisateur:');
    console.log(`   ID: ${data.user?.id}`);
    console.log(`   Email: ${data.user?.email}`);
    console.log(`   Confirmé: ${data.user?.confirmed_at ? '✅ OUI' : '❌ NON (en attente de confirmation)'}`);
    console.log(`   Créé le: ${data.user?.created_at}`);
    
    if (data.user?.confirmed_at) {
      console.log('\n✅ CONFIRMATION EMAIL DÉSACTIVÉE');
      console.log('   L\'utilisateur est automatiquement confirmé.');
      console.log('   Vous pouvez vous connecter immédiatement!');
    } else {
      console.log('\n⚠️  CONFIRMATION EMAIL ACTIVÉE');
      console.log('   L\'utilisateur doit confirmer son email avant de se connecter.');
      console.log('   Vérifiez votre boîte email pour le lien de confirmation.');
    }
    
    // Test de connexion
    console.log('\n🔍 Test 2: Tentative de connexion\n');
    
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword
    });
    
    if (signInError) {
      console.log('❌ Connexion échouée:');
      console.log(`   ${signInError.message}`);
      
      if (signInError.message.includes('Email not confirmed')) {
        console.log('\n💡 L\'email doit être confirmé avant de se connecter.');
        console.log('   Désactivez la confirmation email pour tester plus facilement.');
      }
    } else {
      console.log('✅ Connexion réussie!');
      console.log('   L\'utilisateur peut accéder au dashboard.');
      
      // Nettoyer - supprimer l'utilisateur de test
      await supabase.auth.signOut();
    }
    
    return true;
  } catch (error) {
    console.log(`\n❌ Erreur inattendue: ${error.message}`);
    return false;
  }
}

async function checkAuthSettings() {
  console.log('\n📋 Vérification de la configuration Auth\n');
  console.log('Pour vérifier vos paramètres d\'authentification:');
  console.log('👉 https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/auth/providers');
  console.log('\nParamètres recommandés pour le développement:');
  console.log('   ☐ Confirm email: DÉSACTIVÉ');
  console.log('   ☑ Enable Email provider: ACTIVÉ');
  console.log('\nParamètres recommandés pour la production:');
  console.log('   ☑ Confirm email: ACTIVÉ');
  console.log('   ☑ Enable Email provider: ACTIVÉ');
  console.log('   ☑ SMTP configuré: OUI');
}

console.log('\n' + '='.repeat(60));

testEmailConfig().then(success => {
  console.log('\n' + '='.repeat(60));
  
  if (success) {
    console.log('\n✅ TESTS TERMINÉS AVEC SUCCÈS!\n');
  } else {
    console.log('\n⚠️  TESTS TERMINÉS AVEC DES ERREURS\n');
    checkAuthSettings();
  }
  
  console.log('\n📖 Pour plus d\'informations:');
  console.log('   - FIX-EMAIL-CONFIRMATION-ERROR.md');
  console.log('   - DESACTIVER-CONFIRMATION-EMAIL.md');
  console.log('\n' + '='.repeat(60) + '\n');
});

