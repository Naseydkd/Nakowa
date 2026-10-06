# 🚀 Guide de Déploiement Vercel - Nakowa

Ce document contient toutes les instructions nécessaires pour déployer l'application Nakowa sur Vercel.

## 📋 Table des Matières

1. [Prérequis](#prérequis)
2. [Variables d'Environnement](#variables-denvironnement)
3. [Configuration Vercel Dashboard](#configuration-vercel-dashboard)
4. [Déploiement](#déploiement)
5. [Post-Déploiement](#post-déploiement)
6. [Dépannage](#dépannage)

---

## 🔧 Prérequis

### 1. Compte Vercel
- Créer un compte sur [vercel.com](https://vercel.com)
- Installer Vercel CLI (optionnel) : `npm i -g vercel`

### 2. Base de Données Supabase
- Compte Supabase actif
- Base de données PostgreSQL créée
- Connection pooling activé (port 6543)

### 3. Secrets de Production
Générer de nouveaux secrets pour la production :

```bash
# JWT_SECRET (32+ caractères recommandés)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CRON_SECRET (24+ caractères recommandés)
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

**⚠️ IMPORTANT:** Ne JAMAIS utiliser les secrets du fichier `.env` en production !

---

## 🔐 Variables d'Environnement

### Variables Backend (13 variables)

Configurer dans **Vercel Dashboard** → **Settings** → **Environment Variables**

#### 🔴 OBLIGATOIRES (8 variables)

| Variable | Valeur | Type | Description |
|----------|--------|------|-------------|
| `DATABASE_URL` | `postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true` | Secret | URL pooler Supabase (port 6543 avec pgbouncer) |
| `DIRECT_DATABASE_URL` | `postgresql://postgres.xxx:password@xxx.supabase.com:5432/postgres` | Secret | URL directe Supabase (port 5432, pour migrations) |
| `JWT_SECRET` | `[NOUVEAU SECRET 64 CARACTÈRES]` | Secret | Clé signature JWT - GÉNÉRER UN NOUVEAU |
| `NODE_ENV` | `production` | Plain Text | Mode production |
| `FRONTEND_URL` | `https://nakowa.vercel.app` | Plain Text | URL frontend (remplacer par votre domaine) |
| `CRON_SECRET` | `[NOUVEAU SECRET 48 CARACTÈRES]` | Secret | Protection endpoints cron - GÉNÉRER UN NOUVEAU |
| `JWT_EXPIRES_IN` | `24h` | Plain Text | Durée validité token |
| `PORT` | `3000` | Plain Text | Port (Vercel gère, mais gardé pour compatibilité) |

#### 🟡 OPTIONNELLES (5 variables - Pour fonctionnalité email)

| Variable | Valeur | Type | Description |
|----------|--------|------|-------------|
| `SMTP_HOST` | `smtp.gmail.com` | Plain Text | Serveur SMTP |
| `SMTP_PORT` | `587` | Plain Text | Port SMTP |
| `SMTP_USER` | `your-email@gmail.com` | Secret | Compte email |
| `SMTP_PASSWORD` | `your-app-password` | Secret | Mot de passe application Gmail |
| `REPORT_EMAIL_RECIPIENTS` | `admin@nakowa.com` | Plain Text | Destinataires rapports |

---

### Variables Frontend (1 variable)

| Variable | Valeur | Type | Description |
|----------|--------|------|-------------|
| `VITE_API_URL` | `https://nakowa.vercel.app/api` | Plain Text | URL backend API (remplacer par votre domaine) |

---

## ⚙️ Configuration Vercel Dashboard

### Étape 1 : Importer le Projet

1. Aller sur [vercel.com/new](https://vercel.com/new)
2. Sélectionner "Import Git Repository"
3. Connecter votre compte GitHub/GitLab
4. Sélectionner le repository `Nakowa`
5. Cliquer sur "Import"

### Étape 2 : Configuration Build

Vercel détectera automatiquement la configuration depuis `vercel.json`, mais vérifier :

**Root Directory:** `.` (racine)

**Build Settings:**
- Framework Preset : `Other`
- Build Command : Auto-détecté depuis `vercel.json`
- Output Directory : Auto-détecté depuis `vercel.json`
- Install Command : `npm install`

### Étape 3 : Variables d'Environnement

1. Aller dans **Settings** → **Environment Variables**
2. Ajouter TOUTES les variables listées ci-dessus
3. Sélectionner l'environnement : **Production**, **Preview**, **Development**

**🔒 Pour les Secrets :**
- ✅ Cocher "Encrypt" pour les variables sensibles
- ✅ Activer pour "Production" uniquement (ou tous selon besoin)

**Exemple de configuration :**

```
DATABASE_URL = postgresql://postgres.xxx:pass@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
[✓] Production  [ ] Preview  [ ] Development
[✓] Encrypt
```

### Étape 4 : Domaine (Optionnel)

1. Aller dans **Settings** → **Domains**
2. Ajouter votre domaine personnalisé
3. Configurer les DNS selon les instructions
4. Mettre à jour `FRONTEND_URL` et `VITE_API_URL` avec le nouveau domaine

---

## 🚀 Déploiement

### Option 1 : Depuis Vercel Dashboard

1. Aller dans l'onglet **Deployments**
2. Cliquer sur **Deploy**
3. Vercel va :
   - Installer les dépendances
   - Générer Prisma Client
   - Exécuter les migrations (`prisma migrate deploy`)
   - Builder le backend NestJS
   - Builder le frontend Vite
   - Déployer les fonctions serverless

### Option 2 : Depuis Git (Recommandé)

```bash
# Commit toutes les modifications
git add .
git commit -m "feat: configuration Vercel production"

# Push vers la branche principale
git push origin main
```

Vercel déclenchera automatiquement un déploiement.

### Option 3 : Vercel CLI

```bash
# Déploiement production
vercel --prod

# Déploiement preview
vercel
```

---

## ✅ Post-Déploiement

### 1. Vérifications Santé

Tester les endpoints critiques :

```bash
# Health check
curl https://nakowa.vercel.app/api/health

# Auth
curl -X POST https://nakowa.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nakowa.com","password":"your-password"}'

# Dashboard (avec token)
curl https://nakowa.vercel.app/api/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 2. Tests Fonctionnels

- [ ] Login fonctionne
- [ ] Dashboard affiche les statistiques
- [ ] Gestion clients (CRUD)
- [ ] Collectes visibles
- [ ] Paiements enregistrables
- [ ] Carte géographique charge

### 3. Vérifier les Logs

1. Aller dans **Deployments** → Sélectionner le déploiement
2. Cliquer sur **Functions**
3. Sélectionner `api/index.ts`
4. Vérifier les logs pour erreurs

### 4. Configuration CRON

Les crons sont automatiquement configurés dans `vercel.json` :

```json
{
  "crons": [
    {
      "path": "/api/reports/send",
      "schedule": "0 8 */2 * *"  // Tous les 2 jours à 8h
    }
  ]
}
```

Vérifier dans **Settings** → **Cron Jobs** que le cron est actif.

### 5. Performance Monitoring

1. Aller dans **Analytics** (si disponible)
2. Surveiller :
   - Temps de réponse API
   - Taux d'erreur
   - Utilisation mémoire
   - Cold start times

---

## 🔍 Dépannage

### Problème 1 : Build Failed - Prisma Generate

**Erreur :**
```
Error: @prisma/client did not initialize yet
```

**Solution :**
- Vérifier que `prisma` est dans `dependencies` (pas `devDependencies`)
- Vérifier que `postinstall: "prisma generate"` existe dans `package.json`

### Problème 2 : Database Connection Failed

**Erreur :**
```
Can't reach database server at `xxx.supabase.com`
```

**Solutions :**
1. Vérifier `DATABASE_URL` et `DIRECT_DATABASE_URL` dans variables Vercel
2. S'assurer que l'URL utilise le pooler (port 6543)
3. Tester la connexion depuis Supabase Dashboard
4. Vérifier les règles de pare-feu Supabase

### Problème 3 : CORS Errors

**Erreur dans console navigateur :**
```
Access to fetch at 'https://api.nakowa.vercel.app' has been blocked by CORS
```

**Solutions :**
1. Vérifier que `FRONTEND_URL` est correctement configuré dans Vercel
2. S'assurer que l'URL frontend correspond exactement
3. Vérifier les headers CORS dans `vercel.json`
4. Voir les logs serverless pour origine bloquée

### Problème 4 : 500 Internal Server Error

**Solutions :**
1. Aller dans **Functions** logs
2. Chercher l'erreur exacte
3. Vérifier que toutes les variables d'environnement sont définies
4. Tester les requêtes localement avec les mêmes variables

### Problème 5 : Function Timeout (10s)

**Erreur :**
```
Task timed out after 10.00 seconds
```

**Solutions :**
1. Optimiser les requêtes database (indexes, limit)
2. Réduire les includes Prisma
3. Augmenter `maxDuration` dans `vercel.json` (max 60s sur Pro)

### Problème 6 : Cold Start Lent

**Symptôme :** Première requête très lente (5-10s)

**Solutions :**
- Utiliser Vercel Edge Functions (si compatible)
- Optimiser les imports (lazy loading)
- Réduire la taille du bundle
- Considérer Vercel Pro (keep-warm)

### Problème 7 : Migrations Failed

**Erreur :**
```
Migration engine error: P1001 Can't reach database
```

**Solutions :**
1. Vérifier que `DIRECT_DATABASE_URL` est défini (sans pooler)
2. Utiliser port 5432 pour `DIRECT_DATABASE_URL`
3. Exécuter migrations manuellement :
```bash
cd nakowa-backend
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

## 📊 Checklist Finale

### Avant Déploiement
- [ ] Tous les secrets régénérés (JWT, CRON)
- [ ] `DATABASE_URL` pointe vers Supabase pooler (6543)
- [ ] `DIRECT_DATABASE_URL` pointe vers Supabase direct (5432)
- [ ] `FRONTEND_URL` correspond au domaine Vercel
- [ ] `VITE_API_URL` correspond au domaine Vercel + `/api`
- [ ] Toutes les variables configurées dans Vercel Dashboard
- [ ] Git repository connecté à Vercel

### Après Déploiement
- [ ] Build réussi (vert ✓)
- [ ] `/api/health` retourne 200
- [ ] Login fonctionne
- [ ] Dashboard charge
- [ ] CORS fonctionnel
- [ ] Aucune erreur dans logs Functions
- [ ] Tests manuels complets
- [ ] Performance acceptable (<2s)

---

## 🆘 Support

### Ressources Utiles

- **Documentation Vercel :** [vercel.com/docs](https://vercel.com/docs)
- **Prisma Vercel Guide :** [pris.ly/d/vercel](https://pris.ly/d/vercel)
- **NestJS Deployment :** [docs.nestjs.com/faq/serverless](https://docs.nestjs.com/faq/serverless)
- **Supabase Pooling :** [supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler](https://supabase.com/docs/guides/database/connecting-to-postgres)

### Commandes Utiles

```bash
# Voir les logs en temps réel
vercel logs [deployment-url] --follow

# Voir les variables d'environnement
vercel env ls

# Ajouter une variable
vercel env add VARIABLE_NAME

# Rollback vers déploiement précédent
vercel rollback [deployment-url]

# Tester le build localement
vercel build

# Lancer en local avec variables production
vercel dev --prod
```

---

## 📝 Notes Importantes

### Limitations Vercel Free Tier
- ⏱️ Timeout fonction : 10 secondes
- 💾 Mémoire : 1024 MB
- 📦 Taille déploiement : 100 MB
- 🔄 Déploiements : Illimités
- 👥 Équipe : 1 membre

### Optimisations Recommandées
1. Activer caching pour assets statiques
2. Utiliser CDN Vercel pour images
3. Compresser réponses API (gzip)
4. Monitorer temps réponse
5. Logs structurés (JSON)

### Sécurité
- ✅ HTTPS automatique (Let's Encrypt)
- ✅ Secrets chiffrés
- ✅ CORS configuré
- ✅ Helmet activé (headers sécurité)
- ✅ Rate limiting (Throttler NestJS)
- ⚠️ Considérer WAF pour production (Vercel Pro)

---

**Version :** 1.0.0  
**Dernière mise à jour :** 6 Octobre 2026  
**Auteur :** Équipe Nakowa
