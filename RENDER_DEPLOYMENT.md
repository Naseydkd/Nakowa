# 🎨 Guide Déploiement Render - Nakowa Backend

Render est excellent pour NestJS et gratuit !

---

## 📋 Configuration Render

### 1. Créer le Web Service

1. Aller sur **https://render.com**
2. Login avec GitHub
3. Cliquer **"New +"** → **"Web Service"**
4. Sélectionner le repo **Nakowa**

### 2. Configuration du Service

**General:**
- **Name:** `nakowa-backend`
- **Region:** Frankfurt (EU Central)
- **Branch:** `main`
- **Root Directory:** `nakowa-backend`

**Build & Deploy:**
- **Runtime:** Node
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm run start:prod`

**Instance Type:**
- **Free** (512 MB RAM, suffisant pour Nakowa)

### 3. Variables d'Environnement

Cliquer sur **"Advanced"** puis ajouter ces variables :

```bash
DATABASE_URL=postgresql://postgres.mwhrglgyblvytldciwtn:JeCommenceParBismillahEtJefiniParAlhamdoullilah@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true

DIRECT_DATABASE_URL=postgresql://postgres.mwhrglgyblvytldciwtn:JeCommenceParBismillahEtJefiniParAlhamdoullilah@aws-0-eu-central-1.pooler.supabase.com:5432/postgres

JWT_SECRET=nakowa-mvp-production-secret-key-2024-very-long-and-random-string

JWT_EXPIRES_IN=24h

NODE_ENV=production

PORT=3000

FRONTEND_URL=https://nakowa-three.vercel.app

CRON_SECRET=sdfghjkdfghjkiuytrtyuioi4567890trfghjproduction
```

**⚠️ IMPORTANT:** Générez de nouveaux secrets JWT et CRON pour la production !

```bash
# JWT_SECRET (64 caractères)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# CRON_SECRET (48 caractères)
node -e "console.log(require('crypto').randomBytes(24).toString('hex'))"
```

### 4. Cliquer sur "Create Web Service"

Render va :
1. ✅ Cloner le repo
2. ✅ Installer les dépendances
3. ✅ Générer Prisma Client
4. ✅ Exécuter les migrations
5. ✅ Builder NestJS
6. ✅ Démarrer l'application

---

## 🌐 URL de votre Backend

Une fois déployé, Render génère une URL comme :
```
https://nakowa-backend.onrender.com
```

**Notez cette URL !**

---

## 🔄 Mettre à jour le Frontend

### Dans Vercel (nakowa-three)

1. **Settings** → **Environment Variables**
2. Modifier `VITE_API_URL` :

```bash
VITE_API_URL=https://nakowa-backend.onrender.com/api
```

3. **Deployments** → **Redeploy**

### Dans Render (backend)

Si vous changez le domaine frontend plus tard, mettez à jour `FRONTEND_URL` dans Render.

---

## ✅ Vérification

### Test Backend
```bash
curl https://nakowa-backend.onrender.com/api/health
```

**Attendu:** `{"status":"ok"}`

### Test Login
```bash
curl -X POST https://nakowa-backend.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@nakowa.com","password":"admin123"}'
```

**Attendu:** Token JWT

### Test Frontend
1. Ouvrir https://nakowa-three.vercel.app
2. Console (F12) → Aucune erreur CORS
3. Login fonctionne ✅

---

## 🎯 Avantages Render

| Feature | Render | Railway | Vercel |
|---------|--------|---------|--------|
| **NestJS** | ✅ Parfait | ✅ Bon | ⚠️ Complexe |
| **Setup** | ✅ 5 min | ✅ 5 min | ⚠️ 2h+ |
| **Root Dir** | ✅ Oui | ⚠️ Complexe | ❌ Non |
| **Logs** | ✅ Temps réel | ✅ Oui | ⚠️ Limité |
| **Gratuit** | ✅ 750h/mois | ✅ 500h | ✅ Oui |
| **Auto-deploy** | ✅ Oui | ✅ Oui | ✅ Oui |

---

## 🆓 Plan Gratuit Render

- **750 heures/mois** (suffisant !)
- **512 MB RAM**
- **0.1 CPU**
- **Auto-sleep après 15min inactivité**
- **Cold start ~30s** (première requête après sleep)

⚠️ **Note:** Le service s'endort après 15 min d'inactivité (gratuit).  
➡️ Première requête après = ~30s de délai (cold start).

---

## 💡 Amélioration : Garder actif (Optionnel)

Pour éviter le cold start, utilisez un service de ping :

**1. UptimeRobot (gratuit)**
- https://uptimerobot.com
- Ping votre URL `/api/health` toutes les 5 minutes
- Maintient le service actif

**2. Cron-job.org**
- https://cron-job.org
- Ping automatique toutes les 14 minutes

---

## 🔍 Dépannage

### Build Failed - Prisma

**Erreur:** `Prisma generate failed`

**Solution:**
1. Vérifier que `prisma` est dans `dependencies` ✅ (déjà fait)
2. Vérifier que `postinstall` existe dans `package.json` ✅ (déjà fait)
3. Vérifier `DATABASE_URL` dans variables Render

### Build Failed - TypeScript

**Erreur:** `tsc: command not found`

**Solution:**
Vérifier que `typescript` est dans `dependencies` ✅ (déjà fait)

### Application Crashed

**Erreur:** `Application failed to start`

**Vérifier les logs:**
1. Render Dashboard → Service
2. **Logs** (en haut)
3. Chercher l'erreur

**Causes courantes:**
- `DATABASE_URL` incorrect
- `JWT_SECRET` manquant
- Port incorrect (doit être 3000 ou `process.env.PORT`)

### CORS Errors

**Erreur:** `No 'Access-Control-Allow-Origin' header`

**Solution:**
1. Vérifier `FRONTEND_URL` dans Render = `https://nakowa-three.vercel.app`
2. Vérifier `VITE_API_URL` dans Vercel = `https://nakowa-backend.onrender.com/api`
3. Redéployer les deux services

---

## 📊 Monitoring

Render offre :
- **Logs en temps réel**
- **Métriques CPU/RAM**
- **Historique déploiements**
- **Alertes email**

Accessible dans : Dashboard → Service → Metrics

---

## 🚀 Déploiement Automatique

Render redéploie automatiquement à chaque push GitHub !

```bash
git add .
git commit -m "feat: nouvelle fonctionnalité"
git push origin main
```

➡️ Render détecte et redéploie automatiquement ✅

---

## 💰 Upgrade vers Paid (Optionnel)

**Starter Plan - $7/mois:**
- **Pas de sleep** (service toujours actif)
- **1 GB RAM**
- **1 CPU**
- Support prioritaire

➡️ Recommandé pour production avec vrais utilisateurs

---

## ✅ Checklist

### Avant déploiement
- [ ] Compte Render créé
- [ ] Repo GitHub connecté
- [ ] Root Directory = `nakowa-backend`
- [ ] Build Command = `npm install && npm run build`
- [ ] Start Command = `npm run start:prod`
- [ ] 8 variables environnement ajoutées (minimum)
- [ ] Secrets JWT et CRON générés (nouveaux)

### Après déploiement
- [ ] Build réussi (vert ✓)
- [ ] Service "Live" (pas "Build failed")
- [ ] URL Render obtenue
- [ ] `/api/health` retourne 200
- [ ] `VITE_API_URL` mis à jour dans Vercel
- [ ] Frontend redéployé
- [ ] Login fonctionne
- [ ] Pas d'erreur CORS
- [ ] Dashboard affiche données

---

## 🎓 Ressources

- **Render Docs :** https://render.com/docs
- **Node.js Guide :** https://render.com/docs/deploy-node-express-app
- **Prisma Guide :** https://render.com/docs/deploy-prisma
- **Status :** https://status.render.com
- **Support :** support@render.com

---

## 🔗 Configuration Finale

**Frontend (Vercel):**
```
URL: https://nakowa-three.vercel.app
VITE_API_URL: https://nakowa-backend.onrender.com/api
```

**Backend (Render):**
```
URL: https://nakowa-backend.onrender.com
FRONTEND_URL: https://nakowa-three.vercel.app
DATABASE_URL: [Supabase pooler]
```

---

**Temps estimé :** 10-15 minutes  
**Difficulté :** ⭐⭐ (Facile)  
**Succès garanti :** ✅ Oui !

---

**Date :** 6 Octobre 2026  
**Version :** 1.0.0
