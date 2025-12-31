


 
1. Définir le périmètre minimal (J0)
 
Objectif : cadrer strictement ce qui sera livré pour tenir 10 jours.
 
Fonctionnalités indispensables (MVP)
 
1. Surveillance automatisée de sources (max. 5 à 10 sources) :
    * France Compétences
    * Mon Compte Formation
    * Qualiopi (actualités)
    * Légifrance (mots-clés formation / financement / réglementation)
    * Pôle emploi, branches pro, OPCO (selon priorité)
2. Moteur d’alertes :
    * Envoi email ou notification si nouvelle info pertinente.
3. Fil d’actualités interne :
    * Liste des événements détectés
    * Filtres : date, source.
4. Tableau de bord simple :
    * Nombre d’alertes / tendances.
5. Interface web simple (mobile + desktop).
6. Back-office minimal :
    * Ajouter/supprimer une source
    * Modifier les mots-clés.
 
Non inclus (pour éviter de dépasser les 10 jours)
 
* IA avancée
* Design élaboré
* Automatisations complexes
* API externes trop instables
* Authentification sophistiquée (prendre un login simple)
 
 
 
2. Cahier des charges (J0)
 
À produire avant de lancer le développement.
 
Contenu obligatoire
 
* Objectif du produit
* Utilisateurs cibles
* Parcours utilisateur simple (3 écrans max)
* Liste des fonctionnalités
* Sources surveillées
* Mots-clés à détecter
* Format des alertes
* Contraintes techniques : langage, hébergement, sécurité minimale
* Budget + délai
 
Durée : 2 heures de travail.
 
 
 
3. Découpage du travail en sprints (J1–J10)
 
 
Sprint 1 — J1–J3 : Base technique
 
* Setup serveur (OVH, Scaleway, Vercel, Render).
* Mise en place du backend (Node.js, Python FastAPI).
* Base de données (PostgreSQL ou MongoDB).
* Intégration du système de scraping ou API RSS.
* Test de récupération sur 2 sources pilotes.
 
 
Sprint 2 — J4–J6 : Core fonctionnel
 
* Intégration de toutes les sources.
* Nettoyage/normalisation des données.
* Mise en place du moteur d’alertes (email ou push).
* Dashboard minimal : liste + filtres.
 
 
Sprint 3 — J7–J8 : Interface utilisateur
 
* 3 à 5 écrans maximum :
    1. Page d’accueil (liste des veilles)
    2. Recherche / filtres
    3. Paramètres (sources + mots-clés)
 
 
Sprint 4 — J9 : Tests et fiabilisation
 
* Tests unitaires
* Tests sur 7 jours de données historiques
* Correction des erreurs
* Stress test simple
 
 
Sprint 5 — J10 : Livraison
 
* Déploiement
* Guide d’utilisation
* Documentation technique minimale
* Contrat de maintenance (1h/semaine)
 
 
 
4. Délivrer un contrat court, protecteur et clair
 
Points à sécuriser avec le freelance :
 
* Livrables exacts
* Code livré sur GitHub avec accès propriétaire
* Interdiction de dépendances non documentées
* Deadline ferme
* Jalons de paiement :
    * 30 % au démarrage
    * 40 % au Milestone J6
    * 30 % à livraison validée
* Garantie de correction 30 jours
 


 
Spécification fonctionnelle complète
 
 
Objectif
 
Fournir une V1 fiable d’une application de veille sur la formation en 10 jours (MVP). Livraison : application web responsive, scraping/RSS de sources configurables, moteur d’alertes, tableau de bord, back-office basique. Code livré sur dépôt Git (propriétaire remis au client).
 
 
Utilisateurs et rôles
 
* CLIENTS : Admin / Propriétaire : configure sources, mots-clés, gère utilisateurs (1 seul pour le MVP).
* Utilisateur standard : consulte le fil d’actualités, crée/active/desactive alertes, filtre et recherche.
 
 
Cas d’usage critiques
 
1. Ajouter une source (URL RSS / page à scraper).
2. Définir mots-clés et niveaux de sensibilité (faible / moyen / élevé).
3. Récupération périodique des flux (cron). /jour/semaine/mois
4. Détection d’événement nouveau et envoi d’alerte par email. Chaque semaine : Vous avez de nouvelles informations à consulter
5. Consultation historique, filtrage et export CSV. (source/date/mots-clés.)
 