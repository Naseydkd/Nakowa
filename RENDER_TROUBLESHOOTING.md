# 🔧 Render - Guide de Dépannage

## ❌ Erreur Actuelle

**Symptôme** : `GET /api/clients?pageSize=1000` retourne 500 Internal Server Error

**Frontend fonctionne** : ✅ Authentification OK, utilisateur ADMIN connecté  
**Backend accessible** : ✅ Render déployé  
**CORS** : ✅ Résolu  
**Problème** : Erreur 500 sur les requêtes base de données

---

## 🔍 Étape 1 : Consulter les Logs Render

### Comment accéder aux logs

1. Va sur [dashboard.render.com](https://dashboard.render.com)
2. Clique sur ton service **nakowa-backend**
3. Clique sur l'onglet **Logs** (en haut)
4. Cherche les lignes contenant :
   - `GET /api/clients`
   - `Error`
   - `PrismaClientKnownRequestError`
   - `Connection`

### Ce que tu dois chercher

#### ✅ Connexion Prisma réussie
```
✅ Prisma connected to database
```

#### ❌ Erreurs possibles

**Erreur 1 : Table inexistante**
```
PrismaClientKnownRequestError: Table 'Client' does not exist
```
→ **Solution** : Les migrations Prisma ne sont pas appliquées (voir Étape 2)

**Erreur 2 : Connexion refusée**
```
Error: Can't reach database server at `db.xxx.supabase.co:6543`
```
→ **Solution** : DATABASE_URL incorrecte (voir Étape 3)

**Erreur 3 : Timeout**
```
Error: Timed out fetching a new connection from the connection pool
```
→ **Solution** : Utiliser pgbouncer=true (voir Étape 3)

**Erreur 4 : Authentification échouée**
```
Error: Authentication failed for user 'postgres'
```
→ **Solution** : Mot de passe incorrect dans DATABASE_URL

---

## 🔧 Étape 2 : Vérifier les Migrations Prisma

### Vérifier sur Supabase

1. Va sur [supabase.com](https://supabase.com)
2. Sélectionne ton projet Nakowa
3. **Table Editor** (menu gauche)
4. Vérifie que ces tables existent :
   - ✅ `Client`
   - ✅ `Service`
   - ✅ `Subscription`
   - ✅ `Payment`
   - ✅ `Collection`
   - ✅ `User`
   - ✅ `ActivityLog`

### Si les tables sont manquantes : Exécuter les migrations

#### Option A : Via Supabase SQL Editor (RECOMMANDÉ)

1. Supabase Dashboard → **SQL Editor**
2. Clique **New Query**
3. Copie TOUT le contenu de ce fichier : `nakowa-backend/prisma/migrations/20261003231339_remove_zone_city_fields/migration.sql`
4. Clique **Run**

#### Option B : Depuis ta machine locale

```bash
cd /Users/macbookpro/Documents/Siteweb/Nakowa/nakowa-backend

# Remplace par ta vraie DATABASE_URL Supabase (port 5432, pas 6543)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres" npx prisma migrate deploy
```

⚠️ **Important** : Utilise le port **5432** (connexion directe) pour les migrations, pas 6543 (pooler).

---

## ⚙️ Étape 3 : Vérifier les Variables d'Environnement Render

### Accéder aux variables

1. Render Dashboard → Service **nakowa-backend**
2. Onglet **Environment**
3. Section **Environment Variables**

### Variables obligatoires

| Variable | Valeur Correcte | Vérifie |
|----------|-----------------|---------|
| `NODE_ENV` | `production` | ✅ |
| `PORT` | `10000` | ✅ |
| `DATABASE_URL` | `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?pgbouncer=true` | ⚠️ Vérifier |
| `JWT_SECRET` | Une longue chaîne aléatoire | ✅ |
| `JWT_EXPIRES_IN` | `24h` | ✅ |
| `FRONTEND_URL` | `https://nakowa-frontend.vercel.app` | ✅ |

### ⚠️ DATABASE_URL - Points critiques

✅ **Correct** :
```
postgresql://postgres:VOTRE_MOT_DE_PASSE@db.abcdefghijk.supabase.co:6543/postgres?pgbouncer=true
```

❌ **Incorrect** :
```
postgresql://postgres:VOTRE_MOT_DE_PASSE@db.abcdefghijk.supabase.co:5432/postgres
                                                                      ^^^^ Port incorrect (5432 = direct)
                                                                                           ^^^^^^^^^^^ Manque pgbouncer
```

### Comment obtenir la bonne DATABASE_URL

1. Va sur Supabase Dashboard
2. **Settings** → **Database**
3. **Connection string** → Onglet **Session pooler**
4. Copie l'URL (elle contient le port 6543)
5. Remplace `[YOUR-PASSWORD]` par ton vrai mot de passe
6. Ajoute `?pgbouncer=true` à la fin

---

## 🔄 Étape 4 : Redémarrer le Service Render

Après toute modification :

1. Render Dashboard → Service backend
2. Onglet **Manual Deploy** (menu en haut à droite)
3. Clique **Clear build cache & deploy**

---

## 🧪 Étape 5 : Tester l'API manuellement

### Test 1 : Health check

Ouvre dans ton navigateur :
```
https://nakowa-backend.onrender.com/api/health
```

**Attendu** :
```json
{
  "status": "ok",
  "timestamp": "2026-10-06T..."
}
```

### Test 2 : Liste clients (sans authentification - devrait donner 401)

```
https://nakowa-backend.onrender.com/api/clients
```

**Attendu** :
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

Si tu vois `500` au lieu de `401` → Problème de base de données confirmé.

---

## 📊 Étape 6 : Vérifier que Supabase accepte les connexions

### Via psql (si installé)

```bash
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:6543/postgres?sslmode=require"
```

Ensuite :
```sql
\dt
```

Tu devrais voir toutes les tables (Client, Service, etc.).

### Via Supabase Dashboard

1. Supabase → **Database** → **Tables**
2. Vérifie que toutes les tables existent
3. Clique sur `Client` → Vérifie qu'il y a des colonnes

---

## 🆘 Étape 7 : Si rien ne marche

### Copie ces informations

1. **Les 30 dernières lignes des logs Render** (copie/colle le texte brut)
2. **La valeur de DATABASE_URL sur Render** (masque le mot de passe avec `***`)
3. **Screenshot de Supabase Table Editor** montrant la liste des tables

Exemple de logs à copier :
```
[2026-10-06 15:30:22] Starting server...
[2026-10-06 15:30:23] ✅ Prisma connected to database
[2026-10-06 15:30:24] 🚀 Nakowa Backend running on port 10000
[2026-10-06 15:30:30] GET /api/clients?pageSize=1000
[2026-10-06 15:30:30] Error: [COPIER L'ERREUR EXACTE ICI]
```

---

## 🎯 Checklist Finale

Avant de continuer, vérifie que :

- [ ] Les logs Render montrent "✅ Prisma connected to database"
- [ ] Les tables existent dans Supabase Table Editor
- [ ] DATABASE_URL utilise le port 6543 + ?pgbouncer=true
- [ ] Le mot de passe dans DATABASE_URL est correct
- [ ] `/api/health` retourne 200 OK
- [ ] Le service Render a été redémarré après les modifications

---

## 📞 Prochaine Étape

Une fois que tu as :
1. Consulté les logs Render
2. Vérifié les tables Supabase
3. Vérifié DATABASE_URL

Reviens avec ces informations et on pourra résoudre le problème exactement.
