# 🔄 Migration Base de Données QualiApps

## 📋 Résumé des changements

### Avant (ancienne structure)
- Authentification via `auth.users` de Supabase
- Table `profiles` avec `id` = `auth.users.id`
- Nécessitait confirmation email

### Après (nouvelle structure)
- Table `users` personnalisée avec hashage bcrypt
- Table `profiles` avec `user_id` → `users.id`
- **Pas de confirmation email** - activation immédiate
- Session gérée via localStorage

---

## 🚀 Instructions de Migration

### Étape 1: Exécuter le SQL

1. Ouvrez l'éditeur SQL Supabase:
   👉 https://supabase.com/dashboard/project/hvtsmovlsppvuncgvjvr/sql/new

2. Copiez le contenu de `EXECUTE-THIS-SQL.sql`

3. Collez et exécutez (Ctrl+Enter ou Cmd+Enter)

4. Vérifiez le résultat:
   - 6 tables créées: `users`, `profiles`, `reports`, `documents`, `non_conformities`, `audit_states`
   - 2 fonctions: `register_user`, `authenticate_user`

### Étape 2: Tester l'application

```bash
npm run dev
```

Allez sur http://localhost:3000/signup et créez un compte.

---

## 📊 Nouveau Schéma

```
┌─────────────────────────────────────────────────────────────┐
│                        USERS                                 │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ email (TEXT, UNIQUE)                                        │
│ password_hash (TEXT) ← bcrypt                               │
│ is_active (BOOLEAN)                                         │
│ created_at, updated_at, last_login_at                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:1
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                       PROFILES                               │
├─────────────────────────────────────────────────────────────┤
│ id (UUID, PK)                                               │
│ user_id (UUID, FK → users.id, UNIQUE)                       │
│ settings (JSONB)                                            │
│ created_at, updated_at                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ 1:N
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
     ┌──────────┐      ┌──────────┐      ┌──────────┐
     │ REPORTS  │      │  DOCS    │      │    NC    │
     │ user_id  │      │ user_id  │      │ user_id  │
     └──────────┘      └──────────┘      └──────────┘
```

---

## 🔐 Stratégie d'Authentification

### Inscription (`signUp`)
1. Appelle la fonction SQL `register_user(email, password)`
2. Le mot de passe est hashé avec bcrypt (cost 10)
3. Un profil vide est créé automatiquement
4. L'utilisateur est immédiatement actif (pas de confirmation email)
5. Session stockée dans localStorage

### Connexion (`signIn`)
1. Appelle la fonction SQL `authenticate_user(email, password)`
2. Vérifie le hash bcrypt
3. Met à jour `last_login_at`
4. Session stockée dans localStorage

### Déconnexion (`signOut`)
1. Supprime la session de localStorage

---

## 📁 Fichiers Modifiés

| Fichier | Changements |
|---------|-------------|
| `services/auth.ts` | **NOUVEAU** - Service d'authentification |
| `app/login/page.tsx` | Utilise `signIn()` au lieu de Supabase Auth |
| `app/signup/page.tsx` | Utilise `signUp()`, pas de confirmation email |
| `app/dashboard/page.tsx` | Utilise `getCurrentUser()` et `signOut()` |
| `services/db.ts` | Requêtes avec `user_id` au lieu de `id` |
| `middleware.ts` | Simplifié (pas de vérification serveur) |
| `supabase-schema.sql` | Nouveau schéma complet |

---

## ⚠️ Notes Importantes

1. **Les anciennes données seront perdues** - Ce script supprime toutes les tables existantes

2. **Les anciens utilisateurs Supabase Auth ne fonctionneront plus** - Ils doivent se réinscrire

3. **La session est côté client uniquement** - Pour une sécurité accrue en production, envisagez d'ajouter des tokens JWT

---

## 🆘 Dépannage

### Erreur "function register_user does not exist"
→ Exécutez le SQL complet dans Supabase

### Erreur "relation users does not exist"
→ Exécutez le SQL complet dans Supabase

### L'inscription ne fonctionne pas
→ Vérifiez les logs dans la console du navigateur
→ Vérifiez que RLS est activé avec les bonnes politiques

---

## ✅ Checklist

- [ ] Exécuter `EXECUTE-THIS-SQL.sql` dans Supabase
- [ ] Vérifier que les 6 tables sont créées
- [ ] Lancer `npm run dev`
- [ ] Tester l'inscription sur /signup
- [ ] Tester la connexion sur /login
- [ ] Vérifier l'accès au dashboard

