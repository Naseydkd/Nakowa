# 🚂 Guide Déploiement Railway - Nakowa Backend

Railway est parfait pour NestJS ! Configuration ultra-simple.

---

## 📋 Étape 1 : Créer un compte Railway

1. Aller sur **https://railway.app**
2. Cliquer sur **"Start a New Project"** ou **"Login with GitHub"**
3. Se connecter avec GitHub (recommandé)

---

## 🚀 Étape 2 : Créer le projet

1. Dans Railway Dashboard, cliquer sur **"New Project"**
2. Sélectionner **"Deploy from GitHub repo"**
3. Autoriser Railway à accéder à vos repos
4. Sélectionner le repo **"Nakowa"**

---

## ⚙️ Étape 3 : Configuration

### 3.1 Root Directory

Railway va détecter le projet. Configurez :

1. Cliquer sur le service créé
2. Aller dans **Settings**
3. Dans **Build & Deploy** :
   - **Root Directory:** `nakowa-backend`
   - **Build Command:** `npm run build`
   - **Start Command:** `npm run start:prod`

### 3.2 Variables d'environnement

1. Dans le service, cliquer sur **Variables**
2. Ajouter **TOUTES** ces variables :

```bash
# Database (Supabase)
DATABASE_URL=postgresql://postgres.xxx:password@xxx.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_DATABASE_URL=postgresql://postgres.xxx:password@xxx.supabase.com:5432/postgres

# JWT (GÉNÉRER NOUVEAU)
JWT_SECRET=[64 caractères aléatoires]
JWT_EXPIRES_IN=24h

# Server
NODE_ENV=production
PORT=3000

# CORS - URL FRONTEND
FRONTEND_URL=https://nakowa-three.vercel.app

# Cron
CRON_SECRET=[48 caractères aléatoires]

# Email (optionnel)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
REPORT_EMAIL_RECIPIENTS=admin@nakowa.com
```

**Générer les secrets :**
```bash
# JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CRON_SECRET
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

---

## 🌐 Étape 4 : Obtenir l'URL

1. Une fois déployé, Railway génère une URL publique
2. Aller dans **Settings** → **Networking**
3. Cliquer sur **Generate Domain**
4. Vous obtiendrez une URL comme : `nakowa-backend-production.up.railway.app`

**⚠️ Notez cette URL !**

---

## 🔧 Étape 5 : Mettre à jour le Frontend

### 5.1 Dans Vercel (nakowa-three)

1. Aller dans **Settings** → **Environment Variables**
2. Modifier `VITE_API_URL` :

```bash
VITE_API_URL=https://nakowa-backend-production.up.railway.app/api
```

3. Redéployer le frontend

### 5.2 Dans Railway (backend)

1. Mettre à jour la variable `FRONTEND_URL` si nécessaire
2. Railway redéploiera automatiquement

---

## ✅ Étape 6 : Vérification

### Test Backend
```bash
curl https://votre-url.railway.app/api/health
```
**Attendu :** 200 OK

### Test Frontend → Backend
1. Ouvrir https://nakowa-three.vercel.app
2. Ouvrir Console (F12)
3. Vérifier aucune erreur CORS
4. Tester le login

---

## 📝 Fichiers à Modifier

### 1. Nettoyer vercel.json backend (optionnel)

Le fichier `nakowa-backend/vercel.json` n'est plus nécessaire.
Vous pouvez le supprimer ou le renommer en `vercel.json.backup`

### 2. Mettre à jour main.ts CORS (déjà fait)

Le CORS dans `main.ts` est déjà configuré correctement.

---

## 🎯 Avantages Railway vs Vercel

| Feature | Railway | Vercel |
|---------|---------|--------|
| **NestJS Support** | ✅ Natif | ⚠️ Complexe |
| **Long-running** | ✅ Oui | ❌ Serverless |
| **WebSocket** | ✅ Oui | ❌ Non |
| **Logs** | ✅ Temps réel | ⚠️ Limité |
| **Database** | ✅ Intégré | ❌ Externe |
| **Gratuit** | ✅ 500h/mois | ✅ Oui |
| **Setup** | ✅ 5 min | ⚠️ 2h+ |

---

## 🆓 Plan Gratuit Railway

- **500 heures/mois** d'exécution
- **100 GB** sortant
- **8 GB RAM** max
- **8 vCPU** max

➡️ **Largement suffisant pour Nakowa !**

---

## 🔍 Dépannage

### Problème : Build Failed

**Vérifier :**
1. Root Directory = `nakowa-backend`
2. Build Command = `npm run build`
3. Toutes les variables env définies

### Problème : Application Crash

**Vérifier les logs :**
1. Railway Dashboard → Service
2. Onglet **Deployments**
3. Cliquer sur le déploiement
4. Voir les logs en temps réel

**Causes courantes :**
- DATABASE_URL incorrect
- JWT_SECRET manquant
- PORT non défini (doit être 3000)

### Problème : CORS après migration

**Si erreurs CORS persistent :**

1. Vérifier que `FRONTEND_URL` dans Railway = `https://nakowa-three.vercel.app`
2. Vérifier que `VITE_API_URL` dans Vercel frontend = URL Railway + `/api`
3. Redéployer les deux (Railway auto, Vercel manuel)

---

## 📊 Monitoring

Railway offre des métriques en temps réel :
- **CPU usage**
- **Memory usage**
- **Request count**
- **Response time**

Accessible dans : Dashboard → Service → Metrics

---

## 🚀 Déploiement Automatique

Railway se redéploie automatiquement à chaque push sur GitHub !

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

➡️ Railway détecte et déploie automatiquement ✅

---

## 💡 Commandes Utiles

### Voir les logs en temps réel
```bash
# Installer Railway CLI (optionnel)
npm i -g @railway/cli

# Login
railway login

# Lier au projet
railway link

# Voir les logs
railway logs
```

### Variables d'environnement via CLI
```bash
# Voir toutes les variables
railway variables

# Ajouter une variable
railway variables set KEY=value
```

---

## ✅ Checklist Finale

### Avant déploiement
- [ ] Compte Railway créé
- [ ] Repo GitHub connecté
- [ ] Root Directory = `nakowa-backend`
- [ ] Build Command = `npm run build`
- [ ] Start Command = `npm run start:prod`
- [ ] 9 variables environnement minimum ajoutées
- [ ] Secrets JWT et CRON générés (nouveaux)

### Après déploiement
- [ ] Build réussi (vert ✓)
- [ ] URL Railway générée
- [ ] `/api/health` retourne 200
- [ ] `VITE_API_URL` mis à jour dans Vercel frontend
- [ ] Frontend redéployé
- [ ] Login fonctionne
- [ ] Pas d'erreur CORS
- [ ] Dashboard affiche données

---

## 🎓 Ressources

- **Railway Docs :** https://docs.railway.app
- **Railway Status :** https://status.railway.app
- **Railway Discord :** https://discord.gg/railway
- **Pricing :** https://railway.app/pricing

---

**Temps de déploiement estimé :** 10-15 minutes  
**Difficulté :** ⭐⭐ (Facile)  
**Succès garanti :** ✅ Oui !

---

**Date :** 6 Octobre 2026  
**Version :** 1.0.0
