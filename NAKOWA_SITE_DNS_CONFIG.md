# 🌐 Configuration DNS pour nakowa.site

## 📋 Architecture finale

| Service | URL |
|---------|-----|
| **Frontend** | `https://nakowa.site` et `https://www.nakowa.site` |
| **Backend API** | `https://api.nakowa.site` |

---

## 🔧 ÉTAPE 1 : Configuration DNS sur Hostinger

### Accéder à la gestion DNS

1. Connecte-toi sur [hpanel.hostinger.com](https://hpanel.hostinger.com)
2. **Domaines** → Clique sur **nakowa.site**
3. Clique sur **DNS / Zone DNS**

### Enregistrements DNS à ajouter

⚠️ **IMPORTANT** : Supprime d'abord tous les anciens enregistrements A ou CNAME pour `@` et `www` si Hostinger en a créés par défaut.

#### ✅ Ajoute ces 3 enregistrements :

| Type | Nom | Pointe vers | TTL |
|------|-----|-------------|-----|
| `A` | `@` | `76.76.21.21` | 3600 |
| `CNAME` | `www` | `cname.vercel-dns.com.` | 3600 |
| `CNAME` | `api` | `nakowa-backend.onrender.com.` | 3600 |

> 📝 **Note** : Le point `.` à la fin de `cname.vercel-dns.com.` et `nakowa-backend.onrender.com.` est important (certains systèmes l'ajoutent automatiquement).

### Capture d'écran de ce que tu devrais voir

```
Type    Nom    Valeur                           TTL
────────────────────────────────────────────────────
A       @      76.76.21.21                      3600
CNAME   www    cname.vercel-dns.com             3600
CNAME   api    nakowa-backend.onrender.com      3600
```

---

## ⚙️ ÉTAPE 2 : Configuration Vercel (Frontend)

### Ajouter le domaine custom

1. Va sur [vercel.com/dashboard](https://vercel.com/dashboard)
2. Sélectionne le projet **nakowa-frontend**
3. **Settings** → **Domains**
4. Clique **Add Domain**
5. Entre : `nakowa.site`
6. Clique **Add**

Vercel va te demander d'ajouter aussi `www.nakowa.site` :
- Clique **Add** pour l'ajouter aussi
- Configure la redirection : **Redirect www.nakowa.site to nakowa.site** (recommandé)

### Validation

- Attends 5-15 minutes (propagation DNS)
- Vercel validera automatiquement
- Certificat SSL généré automatiquement par Vercel ✅

---

## ⚙️ ÉTAPE 3 : Configuration Render (Backend)

### Ajouter le domaine custom

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Sélectionne ton service **nakowa-backend**
3. **Settings** (menu gauche)
4. Section **Custom Domain**
5. Clique **Add Custom Domain**
6. Entre : `api.nakowa.site`
7. Clique **Save**

### Validation

- Render va vérifier l'enregistrement DNS `CNAME api → nakowa-backend.onrender.com`
- Si déjà configuré à l'étape 1, validation automatique
- Certificat SSL généré automatiquement par Render ✅

---

## 🔧 ÉTAPE 4 : Mettre à jour les variables d'environnement

### 4.1 Backend Render : FRONTEND_URL

1. Render Dashboard → Service **nakowa-backend**
2. **Environment** (menu gauche)
3. Modifie la variable `FRONTEND_URL` :
   - **Valeur actuelle** : `https://nakowa-frontend.vercel.app`
   - **Nouvelle valeur** : `https://nakowa.site`
4. Clique **Save Changes**
5. Render va automatiquement redéployer

### 4.2 Frontend Vercel : VITE_API_URL

1. Vercel Dashboard → Projet **nakowa-frontend**
2. **Settings** → **Environment Variables**
3. Modifie la variable `VITE_API_URL` :
   - **Valeur actuelle** : `https://nakowa-backend.onrender.com/api`
   - **Nouvelle valeur** : `https://api.nakowa.site/api`
4. Applique à : **Production**, **Preview**, **Development**
5. **Save**
6. Va dans **Deployments** → Redeploy le dernier déploiement

---

## ✅ ÉTAPE 5 : Code backend déjà mis à jour

Le code CORS dans `nakowa-backend/src/main.ts` a déjà été mis à jour pour accepter `nakowa.site` et `www.nakowa.site`. ✅

Le commit sera fait automatiquement avec les autres changements.

---

## 🧪 ÉTAPE 6 : Tester la configuration

### Test 1 : Vérifier la propagation DNS

Ouvre un terminal et tape :

```bash
# Vérifier le domaine principal
dig nakowa.site +short
# Résultat attendu : 76.76.21.21

# Vérifier www
dig www.nakowa.site +short
# Résultat attendu : cname.vercel-dns.com.

# Vérifier le sous-domaine API
dig api.nakowa.site +short
# Résultat attendu : nakowa-backend.onrender.com.
```

**Pas de terminal ?** Utilise [dnschecker.org](https://dnschecker.org) :
- Entre `nakowa.site` et vérifie que ça pointe vers `76.76.21.21`
- Entre `api.nakowa.site` et vérifie que ça pointe vers Render

### Test 2 : Frontend accessible avec HTTPS

Ouvre dans ton navigateur :
```
https://nakowa.site
```

**Attendu** :
- ✅ Page Nakowa s'affiche
- ✅ Cadenas vert (HTTPS sécurisé)
- ✅ Pas d'avertissement de sécurité

### Test 3 : Backend API accessible

Ouvre dans ton navigateur :
```
https://api.nakowa.site/api/health
```

**Attendu** :
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T..."
}
```

### Test 4 : Login fonctionnel

1. Va sur `https://nakowa.site`
2. Ouvre la console (F12) → Onglet **Network**
3. Essaie de te connecter
4. Vérifie que les requêtes vont vers `https://api.nakowa.site/api/auth/login`
5. ✅ Pas d'erreurs CORS
6. ✅ Login réussi

---

## ⏱️ Délais

| Étape | Temps |
|-------|-------|
| Configuration DNS Hostinger | Instantané |
| Propagation DNS mondiale | 5-30 minutes (max 48h) |
| Validation Vercel | 5-10 min après propagation |
| Validation Render | 5-10 min après propagation |
| Génération SSL automatique | 2-5 minutes |

**Astuce** : Utilise la navigation privée (Cmd+Shift+N) pour éviter les problèmes de cache pendant les tests.

---

## 📊 Ordre d'exécution recommandé

1. ✅ **Maintenant** : Configure DNS sur Hostinger (Étape 1)
2. ⏳ **Attends 5-10 min** : Propagation DNS
3. ✅ **Puis** : Ajoute domaine sur Vercel (Étape 2)
4. ✅ **Puis** : Ajoute domaine sur Render (Étape 3)
5. ⏳ **Attends 5 min** : Validation + SSL
6. ✅ **Puis** : Change variables d'environnement (Étape 4)
7. ✅ **Enfin** : Teste tout (Étape 6)

---

## 🆘 Problèmes courants

### "Domain is already in use"

**Solution** : Quelqu'un d'autre a déjà ajouté ce domaine sur Vercel/Render. Contacte leur support pour le retirer.

### "DNS validation failed"

**Solution** : Attends encore 10-15 minutes. La propagation DNS peut être lente.

### Erreurs CORS après migration

**Solution** : Le code backend a été mis à jour. Fais un commit/push et Render redéploiera automatiquement.

### Site inaccessible après 24h

**Solution** : Vérifie que les DNS Hostinger sont toujours actifs (parfois réinitialisés par erreur).

---

## 🎯 Checklist finale

- [ ] DNS configuré sur Hostinger (3 enregistrements)
- [ ] Domaine `nakowa.site` ajouté sur Vercel
- [ ] Domaine `www.nakowa.site` ajouté sur Vercel avec redirection
- [ ] Domaine `api.nakowa.site` ajouté sur Render
- [ ] Variable `FRONTEND_URL` mise à jour sur Render → `https://nakowa.site`
- [ ] Variable `VITE_API_URL` mise à jour sur Vercel → `https://api.nakowa.site/api`
- [ ] Frontend redéployé sur Vercel
- [ ] Backend redéployé sur Render (automatique après changement variable)
- [ ] Test `https://nakowa.site` → ✅ Fonctionne
- [ ] Test `https://api.nakowa.site/api/health` → ✅ Fonctionne
- [ ] Test login → ✅ Fonctionne sans erreurs CORS

---

## 🚀 Prochaine étape

**Commence par l'ÉTAPE 1** : Configure les DNS sur Hostinger maintenant.

Une fois fait, dis-moi et je te guiderai pour les étapes suivantes ! 🎉
