# 🚀 Guide Déploiements Vercel Séparés - Nakowa

**Architecture :** Frontend et Backend déployés sur des projets Vercel distincts

- **Frontend :** https://nakowa-three.vercel.app
- **Backend :** https://nakowa-erw45.vercel.app

---

## 📋 Table des Matières

1. [Architecture](#architecture)
2. [Configuration Backend](#configuration-backend)
3. [Configuration Frontend](#configuration-frontend)
4. [Variables d'Environnement](#variables-denvironnement)
5. [Déploiement](#déploiement)
6. [Vérifications](#vérifications)
7. [Dépannage](#dépannage)

---

## 🏗️ Architecture

### Structure Actuelle
```
Nakowa/
├── nakowa-backend/          → Projet Vercel: nakowa-erw45
│   ├── src/
│   ├── prisma/
│   ├── package.json
│   └── vercel.json          ✅ Config backend
│
└── nakowa-frontend/         → Projet Vercel: nakowa-three
    ├── js/
    ├── css/
    ├── index.html
    ├── package.json
    └── vercel.json          ✅ Config frontend
```

### Avantages Déploiements Séparés
✅ **Déploiements indépendants** - Backend et frontend peuvent être déployés séparément  
✅ **Scaling séparé** - Chaque partie peut scaler indépendamment  
✅ **Simplicité** - Pas besoin de wrapper serverless complexe  
✅ **Monitoring distinct** - Logs et métriques séparés  
✅ **Flexibilité** - Possibilité de migrer le backend ailleurs facilement

---

## 🔧 Configuration Backend

### Projet Vercel: `nakowa-erw45`
**URL :** https://nakowa-erw45.vercel.app

### 1. Structure Fichiers

**Root Directory:** `nakowa-backend` (⚠️ IMPORTANT dans settings Vercel)

**Fichiers clés :**
```
nakowa-backend/
├── vercel.json              ← Config Vercel
├── package.json             ← Scripts build
├── src/main.ts              ← Entry point
└── prisma/schema.prisma     ← Database schema
```

### 2. Configuration vercel.json

Le fichier `nakowa-backend/vercel.json` contient :

```json
{
  "version": 2,
  "name": "nakowa-backend",
  "builds": [
    { "src": "package.json", "use": "@vercel/node" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/dist/src/main.js" },
    { "src": "/(.*)", "dest": "/dist/src/main.js" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "https://nakowa-three.vercel.app" }
      ]
    }
  ],
  "crons": [
    { "path": "/api/reports/send", "schedule": "0 8 */2 * *" }
  ],
  "regions": ["cdg1"]
}
```

### 3. Settings Vercel Dashboard (Backend)

#### General Settings
- **Framework Preset:** Other
- **Root Directory:** `nakowa-backend` ⚠️
- **Build Command:** `npm run vercel-build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables (13 variables)

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `DATABASE_URL` | `postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true` | Production |
| `DIRECT_DATABASE_URL` | `postgresql://...@...supabase.com:5432/postgres` | Production |
| `JWT_SECRET` | `[64+ caractères aléatoires]` | Production (Encrypt) |
| `JWT_EXPIRES_IN` | `24h` | Production |
| `NODE_ENV` | `production` | Production |
| `PORT` | `3000` | Production |
| `FRONTEND_URL` | `https://nakowa-three.vercel.app` | Production |
| `CRON_SECRET` | `[48+ caractères aléatoires]` | Production (Encrypt) |
| `SMTP_HOST` | `smtp.gmail.com` | Production (optionnel) |
| `SMTP_PORT` | `587` | Production (optionnel) |
| `SMTP_USER` | `your-email@gmail.com` | Production (optionnel, Encrypt) |
| `SMTP_PASSWORD` | `app-password` | Production (optionnel, Encrypt) |
| `REPORT_EMAIL_RECIPIENTS` | `admin@nakowa.com` | Production (optionnel) |

**⚠️ IMPORTANT :**
- `FRONTEND_URL` doit être `https://nakowa-three.vercel.app` (sans trailing slash)
- `DATABASE_URL` doit utiliser le pooler (port 6543)
- `DIRECT_DATABASE_URL` pour migrations (port 5432)

### 4. Script Build Backend

Le script `vercel-build` dans `package.json` :
```json
{
  "scripts": {
    "vercel-build": "prisma generate && prisma migrate deploy && nest build"
  }
}
```

**Étapes automatiques :**
1. ✅ Génération Prisma Client
2. ✅ Exécution migrations database
3. ✅ Build NestJS → `dist/`

---

## 🎨 Configuration Frontend

### Projet Vercel: `nakowa-three`
**URL :** https://nakowa-three.vercel.app

### 1. Structure Fichiers

**Root Directory:** `nakowa-frontend` (⚠️ IMPORTANT dans settings Vercel)

**Fichiers clés :**
```
nakowa-frontend/
├── vercel.json              ← Config Vercel
├── vite.config.js           ← Config Vite
├── package.json             ← Scripts build
├── index.html               ← Entry point
├── js/
│   └── core/config.js       ← API URL configuration
└── dist/                    ← Output (généré par build)
```

### 2. Configuration vercel.json

Le fichier `nakowa-frontend/vercel.json` contient :

```json
{
  "version": 2,
  "name": "nakowa-frontend",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ],
  "regions": ["cdg1"]
}
```

**Points clés :**
- ✅ Rewrites SPA : toutes les routes → `index.html`
- ✅ Cache assets : 1 an pour `/assets/*`
- ✅ Security headers : XSS, frame, content-type

### 3. Settings Vercel Dashboard (Frontend)

#### General Settings
- **Framework Preset:** Vite
- **Root Directory:** `nakowa-frontend` ⚠️
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

#### Environment Variables (1 variable)

| Variable | Valeur | Environnement |
|----------|--------|---------------|
| `VITE_API_URL` | `https://nakowa-erw45.vercel.app/api` | Production |

**⚠️ IMPORTANT :**
- L'URL doit pointer vers le backend avec `/api` à la fin
- Vérifier que l'URL correspond exactement au déploiement backend

### 4. Configuration API URL

Le fichier `js/core/config.js` :
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Production: https://nakowa-erw45.vercel.app/api
// Development: http://localhost:3000/api
```

**Fonctionnement :**
- En **production** : Utilise `VITE_API_URL` depuis Vercel env vars
- En **développement** : Fallback sur `localhost:3000/api`

---

## 🔐 Variables d'Environnement

### Générer les Secrets

**JWT_SECRET (64 caractères) :**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**CRON_SECRET (48 caractères) :**
```bash
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

### Configuration dans Vercel Dashboard

#### Pour le Backend (nakowa-erw45)
1. Aller sur https://vercel.com/dashboard
2. Sélectionner projet `nakowa-erw45` (backend)
3. **Settings** → **Environment Variables**
4. Ajouter les 13 variables listées ci-dessus
5. Cocher **Production** pour chaque variable
6. Cocher **Encrypt** pour les secrets (JWT, DB passwords, SMTP, CRON)

#### Pour le Frontend (nakowa-three)
1. Sélectionner projet `nakowa-three` (frontend)
2. **Settings** → **Environment Variables**
3. Ajouter `VITE_API_URL` = `https://nakowa-erw45.vercel.app/api`
4. Cocher **Production**

---

## 🚀 Déploiement

### Option 1 : Git Push (Recommandé)

#### Backend
```bash
cd nakowa-backend
git add .
git commit -m "feat: configuration production backend"
git push origin main
```
→ Vercel redéploie automatiquement `nakowa-erw45`

#### Frontend
```bash
cd nakowa-frontend
git add .
git commit -m "feat: configuration production frontend"
git push origin main
```
→ Vercel redéploie automatiquement `nakowa-three`

### Option 2 : Vercel CLI

#### Backend
```bash
cd nakowa-backend
vercel --prod
```

#### Frontend
```bash
cd nakowa-frontend
vercel --prod
```

### Option 3 : Depuis Vercel Dashboard

1. Aller dans **Deployments**
2. Cliquer sur **Deploy** (ou **Redeploy**)
3. Confirmer

---

## ✅ Vérifications Post-Déploiement

### Backend (nakowa-erw45.vercel.app)

#### 1. Health Check
```bash
curl https://nakowa-erw45.vercel.app/api/health
```
**Attendu :** `200 OK`

#### 2. Test Login
```bash
curl -X POST https://nakowa-erw45.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nakowa.com","password":"votre-password"}'
```
**Attendu :** `{ "access_token": "...", "user": {...} }`

#### 3. Vérifier Logs
- Aller dans **Deployments** → Sélectionner le déploiement
- Cliquer sur **View Function Logs**
- Vérifier absence d'erreurs

### Frontend (nakowa-three.vercel.app)

#### 1. Accès Page
```bash
curl -I https://nakowa-three.vercel.app
```
**Attendu :** `200 OK`

#### 2. Test Interface
1. Ouvrir https://nakowa-three.vercel.app dans navigateur
2. Vérifier que la page charge
3. Ouvrir **DevTools Console** (F12)
4. Vérifier absence d'erreurs CORS

#### 3. Test Login UI
1. Aller sur page login
2. Entrer credentials
3. Vérifier connexion réussie
4. Vérifier redirection vers dashboard

### Tests Fonctionnels Complets

- [ ] **Login** fonctionne
- [ ] **Dashboard** affiche statistiques
- [ ] **Clients** - Liste visible
- [ ] **Clients** - Ajout nouveau client
- [ ] **Clients** - Modification client
- [ ] **Collectes** - Liste visible
- [ ] **Collectes** - Marquer comme collecté
- [ ] **Collectes** - Signaler problème
- [ ] **Paiements** - Liste visible
- [ ] **Paiements** - Ajouter paiement
- [ ] **Carte** - Charge et affiche clients
- [ ] **Abonnements** - Gestion mensuelle

---

## 🔍 Dépannage

### Problème 1 : CORS Error

**Symptôme :**
```
Access to fetch at 'https://nakowa-erw45.vercel.app/api/...' 
from origin 'https://nakowa-three.vercel.app' has been blocked by CORS
```

**Solutions :**

1. **Vérifier FRONTEND_URL dans backend**
   - Vercel Dashboard → `nakowa-erw45` → Environment Variables
   - `FRONTEND_URL` doit être exactement `https://nakowa-three.vercel.app`
   - Pas de trailing slash `/`

2. **Vérifier main.ts**
   ```typescript
   const allowedOrigins = [
     'https://nakowa-three.vercel.app', // Doit être présent
     // ...
   ];
   ```

3. **Redéployer le backend**
   ```bash
   cd nakowa-backend
   git push origin main
   ```

4. **Vider cache navigateur**
   - Chrome : `Ctrl+Shift+Delete` → Cache
   - Ou mode incognito

### Problème 2 : API URL Non Trouvée (404)

**Symptôme :**
```
GET https://nakowa-three.vercel.app/api/... 404 Not Found
```

**Cause :** Frontend appelle l'API sur lui-même au lieu du backend

**Solution :**

1. **Vérifier VITE_API_URL dans frontend**
   - Vercel Dashboard → `nakowa-three` → Environment Variables
   - `VITE_API_URL` = `https://nakowa-erw45.vercel.app/api`

2. **Redéployer le frontend**
   ```bash
   cd nakowa-frontend
   git push origin main
   ```

3. **Vérifier dans navigateur**
   - Console DevTools
   - Vérifier l'URL dans `Network` tab

### Problème 3 : Database Connection Failed

**Symptôme :**
```
Error: Can't reach database server
```

**Solutions :**

1. **Vérifier DATABASE_URL**
   - Doit utiliser **pooler** (port 6543)
   - Format : `postgresql://...@...pooler.supabase.com:6543/postgres?pgbouncer=true`

2. **Tester connexion depuis Supabase**
   - Supabase Dashboard → Database
   - Test connection

3. **Vérifier Supabase firewall**
   - Supabase n'a généralement pas de restrictions IP
   - Mais vérifier dans les logs

### Problème 4 : Migrations Failed

**Symptôme :**
```
Error: Migration engine error
```

**Solutions :**

1. **Vérifier DIRECT_DATABASE_URL**
   - Doit être connexion **directe** (port 5432)
   - Format : `postgresql://...@...supabase.com:5432/postgres`
   - **SANS** `?pgbouncer=true`

2. **Exécuter migrations manuellement**
   ```bash
   cd nakowa-backend
   export DATABASE_URL="votre-direct-url"
   npx prisma migrate deploy
   ```

3. **Redéployer backend**

### Problème 5 : Page Blanche Frontend

**Symptôme :**
- Page blanche
- Console : erreur JavaScript

**Solutions :**

1. **Vérifier build Vite**
   ```bash
   cd nakowa-frontend
   npm run build
   npm run preview
   ```

2. **Vérifier console erreurs**
   - F12 → Console
   - Erreur module import ?

3. **Vérifier vercel.json rewrites**
   ```json
   {
     "rewrites": [
       { "source": "/(.*)", "destination": "/index.html" }
     ]
   }
   ```

### Problème 6 : Cron Job Ne Fonctionne Pas

**Symptôme :**
- Rapports emails non envoyés
- Cron ne s'exécute pas

**Solutions :**

1. **Vérifier configuration cron**
   - `nakowa-backend/vercel.json`
   - Path doit être `/api/reports/send`

2. **Vérifier CRON_SECRET**
   - Variable définie dans backend
   - Header `x-cron-secret` correct

3. **Tester manuellement**
   ```bash
   curl -X POST https://nakowa-erw45.vercel.app/api/reports/test \
     -H "x-cron-secret: votre-secret"
   ```

4. **Vérifier dans Vercel Dashboard**
   - **Settings** → **Cron Jobs**
   - Voir historique exécutions

---

## 📊 Checklist Complète

### Configuration Initiale

#### Backend (nakowa-erw45)
- [ ] Root directory = `nakowa-backend`
- [ ] Framework = Other
- [ ] Build command = `npm run vercel-build`
- [ ] Output directory = `dist`
- [ ] 13 variables environnement configurées
- [ ] `FRONTEND_URL` = `https://nakowa-three.vercel.app`
- [ ] `DATABASE_URL` pointe vers pooler (6543)
- [ ] `DIRECT_DATABASE_URL` pointe vers direct (5432)
- [ ] Secrets JWT et CRON générés et configurés
- [ ] vercel.json présent dans `nakowa-backend/`

#### Frontend (nakowa-three)
- [ ] Root directory = `nakowa-frontend`
- [ ] Framework = Vite
- [ ] Build command = `npm run build`
- [ ] Output directory = `dist`
- [ ] 1 variable environnement configurée
- [ ] `VITE_API_URL` = `https://nakowa-erw45.vercel.app/api`
- [ ] vercel.json présent dans `nakowa-frontend/`
- [ ] vite.config.js configuré

### Post-Déploiement

#### Backend
- [ ] Build réussi (vert ✓)
- [ ] `/api/health` retourne 200
- [ ] Login API fonctionne
- [ ] Logs sans erreurs
- [ ] Migrations exécutées
- [ ] Database connectée

#### Frontend
- [ ] Build réussi (vert ✓)
- [ ] Page d'accueil charge
- [ ] Aucune erreur console
- [ ] Aucune erreur CORS
- [ ] Assets chargent (CSS, JS, images)

#### Tests Fonctionnels
- [ ] Login UI fonctionne
- [ ] Dashboard affiche données
- [ ] Toutes les pages accessibles
- [ ] CRUD clients fonctionne
- [ ] Collectes modifiables
- [ ] Paiements enregistrables
- [ ] Carte géographique fonctionne

---

## 🔗 URLs de Référence

### Production
- **Frontend :** https://nakowa-three.vercel.app
- **Backend :** https://nakowa-erw45.vercel.app
- **API Health :** https://nakowa-erw45.vercel.app/api/health

### Vercel Dashboards
- **Backend :** https://vercel.com/dashboard (projet nakowa-erw45)
- **Frontend :** https://vercel.com/dashboard (projet nakowa-three)

### Documentation
- **Vercel :** https://vercel.com/docs
- **Vite :** https://vitejs.dev
- **NestJS :** https://docs.nestjs.com
- **Prisma :** https://prisma.io/docs
- **Supabase :** https://supabase.com/docs

---

## 📝 Notes Importantes

### Ordre des Déploiements
1. **Backend d'abord** - Pour que l'API soit disponible
2. **Frontend ensuite** - Pour qu'il puisse consommer l'API

### Domaines Custom (Optionnel)
Si vous ajoutez des domaines personnalisés :

**Backend :**
```
nakowa-api.votredomaine.com → nakowa-erw45.vercel.app
```

**Frontend :**
```
nakowa.votredomaine.com → nakowa-three.vercel.app
```

Mettre à jour :
- Backend : `FRONTEND_URL` → nouveau domaine frontend
- Frontend : `VITE_API_URL` → nouveau domaine backend + `/api`
- Backend `main.ts` : ajouter nouveau domaine dans `allowedOrigins`

### Performance
- **Cold Start Backend :** ~2-5 secondes (première requête)
- **Warm Backend :** <500ms
- **Frontend :** Statique, <100ms

### Coûts
- **Free Tier Vercel :**
  - ✅ 2 projets (frontend + backend)
  - ✅ Déploiements illimités
  - ✅ 100GB bandwidth
  - ✅ 1 cron job
  - ⚠️ Timeout 10 secondes

### Alternatives
Si limitations Vercel trop restrictives :
- **Backend :** Railway, Render, Fly.io (meilleur pour NestJS)
- **Frontend :** Reste sur Vercel (optimal)

---

**Version :** 1.0.0  
**Date :** 6 Octobre 2026  
**Architecture :** Déploiements séparés  
**Status :** ✅ Production Ready
