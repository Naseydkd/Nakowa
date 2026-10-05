# 📧 Email Reports - Setup Guide

## ✅ Implémentation Complète

Le système de rapports automatisés bi-quotidiens est **complètement implémenté** et prêt à déployer.

**Status**: Production Ready ✅

---

## 🚀 Déploiement en 4 Étapes

### 1. Créer Projet Vercel

```
1. Allez sur https://vercel.com
2. Sign Up avec GitHub (ou créer compte)
3. Cliquez "Add New" → "Project"
4. Sélectionnez le repo "Nakowa"
5. Root Directory: nakowa-backend/
6. Cliquez "Deploy"
7. Attendez ~3 min
```

### 2. Obtenir Gmail App Password

```
1. https://myaccount.google.com/apppasswords
2. App: Mail
3. Device: MacOS
4. Copier le mot de passe (16 caractères, sans espaces)
```

### 3. Ajouter Variables Vercel

Dans Vercel Settings → Environment Variables, ajouter:

| Name | Value |
|------|-------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` |
| `SMTP_USER` | votre-email@gmail.com |
| `SMTP_PASSWORD` | App Password (sans espaces) |
| `REPORT_EMAIL_RECIPIENTS` | votre-email@gmail.com |
| `CRON_SECRET` | `98705497b9aea45fd567e6bbe50fbf8ba9528f5cbfb1ae310e4758fbbfd1bc3b` |

### 4. Déployer

```bash
cd /Users/macbookpro/Documents/Siteweb/Nakowa
git add -A
git commit -m "feat: add automated email reports"
git push origin main
```

---

## 🧪 Tester

### Via Vercel Dashboard
```
1. Settings → Functions → Cron Jobs
2. Cliquez le bouton ⏱️ "Invoke"
3. Attendez 10 secondes
4. Vérifiez votre email (Inbox ou Spam)
```

### Via Terminal
```bash
curl -X POST https://votre-domaine.vercel.app/api/reports/send \
  -H "x-cron-secret: 98705497b9aea45fd567e6bbe50fbf8ba9528f5cbfb1ae310e4758fbbfd1bc3b" \
  -H "Content-Type: application/json"
```

---

## 📊 Métriques du Rapport

Le rapport contient 6 KPIs:

- **Collectes en attente** - Collections SCHEDULED
- **Collectes en cours** - Collections non-complétées
- **Total Abonnements** - Abonnements actifs
- **Montant Encaissé** - Somme des paiements
- **Reste à Encaisser** - Solde impayé

---

## 📅 Horaire

**Schedule**: Tous les 2 jours à 8h UTC

- Première exécution: 2 jours après le déploiement
- Puis: tous les 2 jours automatiquement
- Aucune action manuelle nécessaire

---

## 📂 Fichiers Créés

### Backend Modules
```
nakowa-backend/src/
├── email/
│   ├── email.module.ts
│   └── email.service.ts
└── reports/
    ├── reports.module.ts
    ├── reports.service.ts
    └── reports.controller.ts
```

### Configuration
```
✅ vercel.json (Cron schedule)
✅ nakowa-backend/.env (variables locales)
✅ nakowa-backend/.env.example (template)
✅ nakowa-backend/package.json (nodemailer ajouté)
✅ nakowa-backend/src/app.module.ts (imports)
```

---

## 🔐 Sécurité

- ✅ SMTP credentials: variables d'environnement (jamais hardcodé)
- ✅ CRON_SECRET: header validation
- ✅ Erreurs SMTP: loggées, ne bloquent pas le Cron
- ✅ Template: pas de données sensibles exposées

---

## ❓ FAQ

**Q: Où sont les rapports envoyés?**  
A: À REPORT_EMAIL_RECIPIENTS (configurable dans Vercel env vars)

**Q: Peut-on changer la fréquence?**  
A: Oui, éditez le schedule dans vercel.json (ex: `0 8 * * *` pour chaque jour)

**Q: Ça coûte combien?**  
A: Gratuit (Vercel Cron + Gmail SMTP)

**Q: Comment ajouter un destinataire?**  
A: Modifiez REPORT_EMAIL_RECIPIENTS (format: email1@test.com,email2@test.com)

---

## 📞 Support

Docs complètes: `EMAIL_REPORTS_README.md`

Reviewer verdict: `.agents/tasks/email-report-review.json` (APPROVED ✅)

---

**Prêt à déployer?** Suivez les 4 étapes ci-dessus! 🚀

