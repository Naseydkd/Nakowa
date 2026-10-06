# 🌐 Configuration Nom de Domaine Hostinger pour Nakowa

## 📋 Vue d'ensemble

**Domaine acheté sur** : Hostinger  
**Frontend déployé sur** : Vercel (`nakowa-frontend.vercel.app`)  
**Backend déployé sur** : Render (`nakowa-backend.onrender.com`)

**Objectif** : Pointer ton domaine vers le frontend Vercel et créer un sous-domaine pour le backend.

---

## 🎯 Architecture finale

Supposons que ton domaine est `nakowa.com` (remplace par le tien) :

| Service | URL Actuelle | Nouvelle URL |
|---------|--------------|--------------|
| **Frontend** | `nakowa-frontend.vercel.app` | `nakowa.com` ou `www.nakowa.com` |
| **Backend API** | `nakowa-backend.onrender.com` | `api.nakowa.com` |

---

## 📝 Étape 1 : Configurer DNS sur Hostinger

### 1.1 Accéder à la gestion DNS

1. Connecte-toi sur [hostinger.com](https://www.hostinger.com)
2. Va dans **Domaines** → Sélectionne ton domaine
3. Clique sur **Gérer** → **DNS / Zone DNS**

### 1.2 Configurer le Frontend (domaine principal)

**Option A : Utiliser le domaine racine (nakowa.com)**

Ajoute ces enregistrements DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| `A` | `@` | `76.76.21.21` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 |

**Option B : Utiliser uniquement www (www.nakowa.com)**

Ajoute ces enregistrements DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| `CNAME` | `@` | `cname.vercel-dns.com` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com` | 3600 |

> ℹ️ **Recommandation** : Option A (avec redirection www → domaine racine)

### 1.3 Configurer le Backend (sous-domaine api)

Ajoute cet enregistrement DNS :

| Type | Nom | Valeur | TTL |
|------|-----|--------|-----|
| `CNAME` | `api` | `nakowa-backend.onrender.com` | 3600 |

### 1.4 Supprimer les enregistrements conflictuels

⚠️ **Important** : Supprime tous les anciens enregistrements A ou CNAME qui pointent vers `@` ou `www` si Hostinger en a créés par défaut.

---

## ⚙️ Étape 2 : Configurer Vercel (Frontend)

### 2.1 Ajouter le domaine custom

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne le projet **nakowa-frontend**
3. **Settings** → **Domains**
4. Clique **Add Domain**
5. Entre ton domaine : `nakowa.com` (ou `www.nakowa.com`)
6. Clique **Add**

### 2.2 Vérification

Vercel va te demander de vérifier la propriété du domaine :

- Si tu as ajouté les bons enregistrements DNS, Vercel validera automatiquement
- Ça peut prendre 5-10 minutes (propagation DNS)
- Une fois validé, Vercel génère automatiquement un certificat SSL (HTTPS)

### 2.3 Configurer les redirections

Dans Vercel, configure :

- **Redirect www to apex** (si tu veux `nakowa.com` au lieu de `www.nakowa.com`)
- Ou **Redirect apex to www** (si tu préfères `www.nakowa.com`)

---

## ⚙️ Étape 3 : Configurer Render (Backend)

### 3.1 Ajouter le domaine custom

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Sélectionne ton service **nakowa-backend**
3. **Settings** → **Custom Domain**
4. Clique **Add Custom Domain**
5. Entre : `api.nakowa.com` (ou `api.tondomaine.com`)
6. Clique **Save**

### 3.2 Vérification

Render va te montrer l'enregistrement DNS à ajouter :

```
CNAME api → nakowa-backend.onrender.com
```

Si tu l'as déjà ajouté à l'étape 1.3, Render validera automatiquement.

### 3.3 SSL/HTTPS

Render génère automatiquement un certificat SSL via Let's Encrypt (gratuit).

---

## 🔧 Étape 4 : Mettre à jour les variables d'environnement

### 4.1 Backend Render : FRONTEND_URL

1. Render Dashboard → Service **nakowa-backend** → **Environment**
2. Modifie la variable `FRONTEND_URL` :
   - **Ancien** : `https://nakowa-frontend.vercel.app`
   - **Nouveau** : `https://nakowa.com` (ou `https://www.nakowa.com`)
3. Sauvegarde et redéploie

### 4.2 Backend : CORS (main.ts)

Le code CORS doit accepter ton nouveau domaine. Vérifie dans `nakowa-backend/src/main.ts` :

```typescript
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://nakowa-three.vercel.app',
  'https://nakowa-frontend.vercel.app',
  'https://nakowa.com',           // ← Ajouter
  'https://www.nakowa.com',        // ← Ajouter
  configService.get<string>('FRONTEND_URL'),
  /^https:\/\/nakowa-.*\.vercel\.app$/,
].filter(Boolean);
```

Si besoin, on ajoutera ces lignes et on commit/push.

### 4.3 Frontend Vercel : VITE_API_URL

1. Vercel Dashboard → Projet **nakowa-frontend** → **Settings** → **Environment Variables**
2. Modifie `VITE_API_URL` :
   - **Ancien** : `https://nakowa-backend.onrender.com/api`
   - **Nouveau** : `https://api.nakowa.com/api`
3. Sauvegarde
4. **Redéploie** le frontend (Deployments → Redeploy)

---

## 🧪 Étape 5 : Tester la configuration

### Test 1 : DNS propagé

Ouvre un terminal et vérifie que les DNS sont bien configurés :

```bash
# Vérifier le domaine principal
dig nakowa.com +short
# Devrait retourner : 76.76.21.21

# Vérifier www
dig www.nakowa.com +short
# Devrait retourner : cname.vercel-dns.com

# Vérifier le sous-domaine API
dig api.nakowa.com +short
# Devrait retourner : nakowa-backend.onrender.com
```

### Test 2 : Frontend accessible

Ouvre dans ton navigateur :
```
https://nakowa.com
```

Tu devrais voir l'application Nakowa avec HTTPS (cadenas vert) ✅

### Test 3 : Backend API accessible

Ouvre dans ton navigateur :
```
https://api.nakowa.com/api/health
```

Tu devrais voir :
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

### Test 4 : Login fonctionnel

1. Va sur `https://nakowa.com`
2. Essaie de te connecter
3. Ouvre la console (F12) → Onglet **Network**
4. Vérifie que les requêtes vont bien vers `https://api.nakowa.com/api/...`
5. Pas d'erreurs CORS ✅

---

## ⏱️ Délais de propagation DNS

| Étape | Délai |
|-------|-------|
| Modification DNS sur Hostinger | Instantané |
| Propagation DNS mondiale | 5 minutes à 48 heures (généralement 15-30 min) |
| Validation Vercel | 5-10 minutes après propagation |
| Validation Render | 5-10 minutes après propagation |
| Certificat SSL (HTTPS) | Automatique après validation |

**Astuce** : Vide le cache DNS de ton navigateur :
- Chrome : `chrome://net-internals/#dns` → Clear host cache
- Safari : Redémarre Safari
- Firefox : Redémarre Firefox

---

## 🎨 Configuration finale recommandée

```
┌─────────────────────────────────────────┐
│          nakowa.com (Hostinger)         │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
  nakowa.com              api.nakowa.com
  (Vercel)                (Render)
  Frontend                Backend API
  HTTPS ✅                HTTPS ✅
```

---

## 📞 Checklist finale

Avant de tester, vérifie que :

- [ ] DNS Hostinger configuré (A + CNAME)
- [ ] Domaine ajouté sur Vercel
- [ ] Domaine custom ajouté sur Render
- [ ] Variable `FRONTEND_URL` mise à jour sur Render
- [ ] Variable `VITE_API_URL` mise à jour sur Vercel
- [ ] CORS mis à jour dans `main.ts` (si nécessaire)
- [ ] Frontend et backend redéployés
- [ ] Propagation DNS terminée (attendre 15-30 min)
- [ ] HTTPS actif sur les deux domaines

---

## 🆘 Problèmes courants

### Problème 1 : "Domain not configured correctly"

**Cause** : DNS pas encore propagé ou mal configuré  
**Solution** : Attends 15-30 minutes, puis vérifie avec `dig tondomaine.com`

### Problème 2 : "NET::ERR_CERT_AUTHORITY_INVALID"

**Cause** : Certificat SSL pas encore généré  
**Solution** : Attends 5-10 minutes, Vercel/Render le génèrent automatiquement

### Problème 3 : Erreurs CORS

**Cause** : Le backend ne reconnaît pas le nouveau domaine  
**Solution** : Ajoute le domaine dans `allowedOrigins` de `main.ts`

### Problème 4 : "This site can't be reached"

**Cause** : DNS Hostinger mal configuré  
**Solution** : Vérifie les enregistrements DNS (étape 1.2 et 1.3)

---

## 📧 Support

Si tu rencontres un problème :

1. Vérifie les logs Render (Backend)
2. Vérifie les logs Vercel (Frontend)
3. Vérifie la console navigateur (F12)
4. Teste les DNS avec `dig` ou [dnschecker.org](https://dnschecker.org)

---

**Prêt à configurer ton domaine ?** Dis-moi quel est ton nom de domaine exact et je t'aiderai avec les valeurs précises ! 🚀
