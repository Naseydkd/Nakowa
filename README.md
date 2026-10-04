# 🌿 Nakowa - Documentation Complète du Système

Ce document centralise l'ensemble des informations techniques, fonctionnelles et opérationnelles du projet **Nakowa**. Il sert de guide de référence pour le développement, le déploiement et l'utilisation du logiciel.

---

## 📖 1. Présentation Générale

**Nakowa** est un logiciel interne conçu pour centraliser la gestion des clients, des abonnements de collecte et des paiements d'une entreprise d'assainissement. L'objectif est de remplacer les processus manuels par un outil numérique simple, sécurisé et efficace.

### Objectifs principaux :
- **Centralisation** : Un seul endroit pour toutes les données clients.
- **Automatisation** : Génération mensuelle des abonnements et des passages de collecte.
- **Visibilité** : Suivi en temps réel de l'avancement des collectes et de la santé financière des clients.
- **Précision** : Géolocalisation des clients pour optimiser les tournées des agents.

---

## 🛠️ 2. Architecture & Stack Technique

Le projet utilise une architecture découplée pour maximiser la performance et la simplicité de maintenance.

### 💻 Frontend (Client)
- **Langages** : HTML5, CSS3, JavaScript Moderne (ES6+).
- **Approche** : Vanilla JS (sans frameworks) pour une légèreté maximale.
- **Routage** : Système de navigation SPA (Single Page Application) personnalisé.
- **Visualisation** : 
    - **Chart.js** pour les statistiques du tableau de bord.
    - **Google Maps API** pour la cartographie interactive.
- **Communication** : `ApiService` centralisé utilisant la Fetch API pour interagir avec le backend REST.

### ⚙️ Backend (API)
- **Framework** : NestJS (TypeScript).
- **ORM** : Prisma (interface entre le code et la base de données).
- **Base de Données** : PostgreSQL (hébergé sur Supabase).
- **Sécurité** : 
    - Authentification via **JWT (JSON Web Tokens)**.
    - Contrôle d'accès basé sur les rôles (**RBAC**) : `ADMIN` et `AGENT`.
    - Protection des en-têtes via **Helmet**.

### 📂 Structure des Dossiers
```text
/
├── nakowa-backend/       # API NestJS, Logique métier, Prisma
│   ├── src/              # Code source (modules clients, subscriptions, collections, etc.)
│   └── prisma/           # Schéma de données et migrations
└── nakowa-frontend/     # Interface utilisateur
    ├── css/             # Styles globaux et composants
    ├── js/              # Logique (core, pages, services)
    └── index.html       # Point d'entrée unique
```

---

## 🔄 3. Guide Fonctionnel Détaillé

### 👥 Gestion des Clients
L'annuaire permet de gérer le cycle de vie du client.
- **Saisie** : Coordonnées, zone géographique et position GPS.
- **Statut** : Un client doit être marqué comme `isActive: true` pour être inclus dans la planification mensuelle.
- **Finance** : Calcul automatique du reste à payer en fonction des paiements enregistrés.

### 🛠️ Services & Abonnements
C'est le moteur de l'application.
- **Définition des Services** : On définit des types d'interventions (ex: Vidange) et on leur assigne un **nombre de passages mensuels** (ex: 2 passages).
- **Préparation du Mois (`prepareMonth`)** : 
    1. Le système identifie tous les clients actifs.
    2. Pour chaque client, il récupère le dernier service utilisé ou un service actif par défaut.
    3. Il crée un **Abonnement** pour le mois cible.
    4. Il génère automatiquement les **Collectes** (passages) correspondantes selon le nombre de passages du service.
- **Réinitialisation (`resetMonth`)** : Permet d'effacer les abonnements et collectes d'un mois spécifique en cas d'erreur.

### 🚚 Suivi des Collectes
L'interface "Collectes" est l'outil principal des agents sur le terrain.
- **Progression Visuelle** : Chaque tâche affiche une barre de progression $\color{green}{(1)}$ $\color{gray}{---}$ $\color{yellow}{(2)}$ indiquant le passage actuel.
- **Validation** : En cliquant sur $\color{green}{\text{✓}}$, l'agent marque le passage comme effectué et capture sa position GPS.
- **Gestion des Incidents** : Le bouton $\color{red}{\text{✗}}$ permet de signaler un problème (Client absent, Accès impossible, etc.).
- **Impact Statistique** : Un problème signalé ne marque pas la tâche comme "Terminée". Elle reste donc dans le décompte des "Restantes" pour garantir que le client soit traité.

### 💰 Paiements & Cartographie
- **Paiements** : Enregistrement multi-modal (Espèces, Mobile Money, Virement) lié à un client.
- **Carte Interactive** : Visualisation des clients avec un code couleur basé sur le paiement :
    - 🟢 **Vert** : Totalement payé.
    - 🟠 **Orange** : Paiement partiel.
    - 🔴 **Rouge** : Non payé.

---

## ⚙️ 4. Installation & Configuration

### Prérequis
- [Node.js](https://nodejs.org/) installé.
- Accès à une instance PostgreSQL (ex: Supabase).

### Étape 1 : Configuration du Backend
1. **Installation** :
   ```bash
   cd nakowa-backend
   npm install
   ```
2. **Environnement** : Créer un fichier `.env` à la racine de `nakowa-backend` :
   ```env
   DATABASE_URL="postgresql://postgres:[PASSWORD]@db.xxxx.supabase.co:5432/postgres"
   JWT_SECRET="votre_cle_secrete"
   SEED_ADMIN_PASSWORD="mot_de_passe_admin"
   ```
3. **Initialisation Prisma** :
   ```bash
   npx prisma generate        # Génère le client JS
   npx prisma migrate dev     # Applique les tables à la DB
   npx prisma db seed        # Ajoute les données initiales
   npx prisma studio
   ```
4. **Lancement** :
   ```bash
   npm run start:dev
   ```

### Étape 2 : Configuration du Frontend
1. **Installation** :
   ```bash
   cd nakowa-frontend
   npm install
   ```
2. **Lancement** :
   ```bash
   npm run dev
   ```
   L'application est accessible sur `http://localhost:5500`.

---

## 🛠️ 5. Maintenance & Troubleshooting

### Problèmes Courants
- **Erreur "Unknown argument" ou "Internal Server Error"** : Souvent dû à un décalage entre le schéma Prisma et le client généré.
  - **Solution** : Exécuter `npx prisma generate` dans le dossier backend et redémarrer le serveur.
- **Erreur 401 Unauthorized** : Le token JWT a expiré ou est absent.
  - **Solution** : Se déconnecter et se reconnecter pour régénérer le token.
- **Données non affichées dans les collectes** : Vérifiez que les clients et les services sont bien marqués comme `isActive: true`.

---

## 📈 6. Évolutions Futures
- **Import CSV/Excel** pour l'ajout massif de clients.
- **Notifications Push** pour les agents lors de nouvelles assignations.
- **Facturation PDF** automatique à la fin de chaque mois.
- **Dockerisation** pour faciliter le déploiement sur un VPS.

---
*Document mis à jour le 27 Septembre 2026 - Développé pour Nakowa.*
