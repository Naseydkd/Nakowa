# Nakowa Email Reports - Deployment & Testing Guide

## Overview

This document describes the automated email report feature that sends statistics every 2 days via Vercel Cron.

### What Gets Reported

The email report includes:
- **Collectes en attente** (Pending collections - SCHEDULED status)
- **Collectes en cours** (In-progress collections - non-completed, non-SCHEDULED)
- **Collectes restantes** (Remaining collections - same as pending)
- **Total Abonnements** (Total active subscriptions)
- **Montant Encaissé** (Total amount collected - sum of all payments)
- **Reste à Encaisser** (Amount remaining - active subscriptions total minus collected)

---

## Local Development Setup

### 1. Configure SMTP in `.env`

Edit `nakowa-backend/.env` and set your SMTP credentials:

```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
REPORT_EMAIL_RECIPIENTS="admin@nakowa.com,manager@nakowa.com"
CRON_SECRET="your-secure-cron-secret-change-me"
```

**For Gmail:**
1. Enable 2-factor authentication
2. Generate an [App Password](https://myaccount.google.com/apppasswords)
3. Use the 16-character App Password as `SMTP_PASSWORD`

### 2. Start the Backend

```bash
cd nakowa-backend
npm run start:dev
```

### 3. Test the Report Endpoint (Manual)

Use the test endpoint (no CRON_SECRET required):

```bash
curl -X POST http://localhost:3000/api/reports/test
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rapport généré (pas de destinataires configurés)",
  "data": {
    "collectesEnAttente": 2,
    "collectesEnCours": 1,
    "collectesRestantes": 2,
    "totalAbonnements": 50,
    "montantEncaisse": 250000,
    "resteEncaisser": 100000,
    "generatedAt": "2024-01-15T10:30:45.123Z"
  },
  "timestamp": "2024-01-15T10:30:45.123Z"
}
```

If SMTP is configured, the email will be sent and the response will say:
```json
{
  "success": true,
  "message": "Rapport de test envoyé",
  ...
}
```

---

## Production Deployment (Vercel)

### 1. Deploy Backend to Vercel

If you haven't already:

```bash
cd nakowa-backend
vercel deploy --prod
```

Or use the Vercel dashboard to connect your GitHub repository.

### 2. Set Environment Variables in Vercel Dashboard

Go to your Vercel project dashboard → Settings → Environment Variables

Add these variables for **Production**:

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | Your Supabase/PostgreSQL URL | Must match production database |
| `JWT_SECRET` | Your JWT secret | Keep it long and random |
| `SMTP_HOST` | `smtp.gmail.com` | Or your SMTP provider |
| `SMTP_PORT` | `587` | For TLS; use `465` for SSL |
| `SMTP_USER` | your-email@gmail.com | Sender email |
| `SMTP_PASSWORD` | Your app password | Not your Gmail password |
| `REPORT_EMAIL_RECIPIENTS` | `admin@nakowa.com,finance@nakowa.com` | Comma-separated recipients |
| `CRON_SECRET` | A long random string | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### 3. Configure Cron Schedule (vercel.json)

The file `/Users/macbookpro/Documents/Siteweb/Nakowa/vercel.json` contains:

```json
{
  "crons": [
    {
      "path": "/api/reports/send",
      "schedule": "0 8 */2 * *"
    }
  ]
}
```

**Schedule breakdown:**
- `0 8` = 08:00 UTC
- `*/2` = Every 2 days
- Full schedule: **Every 2 days at 08:00 UTC**

To change the schedule:
- **Daily at 9 AM UTC**: `0 9 * * *`
- **Every 3 days at 6 AM UTC**: `0 6 */3 * *`
- **Monday and Friday at 9 AM UTC**: `0 9 * * 1,5`

### 4. Deploy vercel.json

Push the updated `vercel.json` to your repository:

```bash
git add vercel.json
git commit -m "chore: configure Cron job for automated email reports"
git push
```

Vercel will automatically redeploy when you push.

---

## Testing in Production

### 1. Manually Trigger the Report

After deployment, test the Cron endpoint by calling it with the secret:

```bash
curl -X POST https://<your-vercel-domain>/api/reports/send \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Rapport envoyé avec succès",
  "timestamp": "2024-01-15T10:45:30.123Z"
}
```

### 2. Check Cron Job Status

In the Vercel dashboard:
1. Go to your project
2. Select the **Functions** tab
3. Look for the `/api/reports/send` endpoint
4. Check the **Logs** for recent invocations

Or in the **Crons** tab:
1. Select the project
2. View the cron job status
3. See execution history and logs

### 3. Monitor Email Delivery

Check your configured email recipient(s):
- `REPORT_EMAIL_RECIPIENTS` email inbox for the HTML report
- Check spam/junk folders if not received

---

## Troubleshooting

### Email Not Sending

**Symptoms:** Cron endpoint returns 200 but email not received.

**Solutions:**
1. **Check SMTP credentials**
   - Verify `SMTP_USER` and `SMTP_PASSWORD` are correct
   - Test with a simple curl: `curl -X POST http://localhost:3000/api/reports/test` locally
   - Check Gmail App Password if using Gmail (not your regular password)

2. **Check email recipients**
   - Ensure `REPORT_EMAIL_RECIPIENTS` is set and valid
   - Try with a single email first: `"admin@nakowa.com"`
   - Verify emails are correctly formatted

3. **Check firewall/port**
   - Ensure outbound port 587 (or 465) is not blocked
   - Test: `telnet smtp.gmail.com 587`

4. **Check logs in Vercel**
   - Vercel dashboard → Functions → Logs
   - Look for error messages in the `/api/reports/send` function

### Cron Job Not Triggering

**Symptoms:** No log entries for the scheduled time.

**Solutions:**
1. **Verify `vercel.json` is deployed**
   - Check that `vercel.json` exists in the repository root
   - Confirm Vercel has redeployed (check deployment date in dashboard)

2. **Verify schedule is correct**
   - Use [cron.help](https://cron.help) to validate the schedule
   - Current schedule `0 8 */2 * *` = every 2 days at 8 AM UTC

3. **Check Cron status in Vercel**
   - Vercel dashboard → Crons tab
   - Ensure the cron job is active and configured correctly

### Database Connection Error

**Symptoms:** Cron returns error about database connection.

**Solutions:**
1. Verify `DATABASE_URL` is set correctly in Vercel
2. Ensure the database is accessible from Vercel (check firewall rules)
3. Test locally to confirm the database query works

---

## File Structure

```
nakowa-backend/
├── src/
│   ├── email/
│   │   ├── email.module.ts
│   │   └── email.service.ts          # Handles SMTP and HTML email template
│   ├── reports/
│   │   ├── reports.module.ts
│   │   ├── reports.service.ts        # Generates report statistics
│   │   └── reports.controller.ts     # Provides /api/reports/* endpoints
│   └── app.module.ts                 # Updated to import EmailModule & ReportsModule
├── .env                              # Production secrets (never commit)
└── package.json                      # Added nodemailer dependency

/
├── vercel.json                       # Cron job configuration
├── .env.example                      # Documentation for environment variables
└── DEPLOYMENT.md                     # This file
```

---

## Environment Variables Reference

| Variable | Required | Default | Purpose |
|----------|----------|---------|---------|
| `SMTP_HOST` | Yes | — | SMTP server hostname |
| `SMTP_PORT` | Yes | — | SMTP server port (587 for TLS, 465 for SSL) |
| `SMTP_USER` | Yes | — | SMTP authentication username (usually an email) |
| `SMTP_PASSWORD` | Yes | — | SMTP authentication password (App Password for Gmail) |
| `REPORT_EMAIL_RECIPIENTS` | Yes | — | Comma-separated list of recipient emails |
| `CRON_SECRET` | Yes | — | Secret to authorize `/api/reports/send` endpoint |
| `DATABASE_URL` | Yes | — | PostgreSQL connection string |
| `JWT_SECRET` | Yes | — | Secret for JWT token signing |

---

## API Endpoints

### POST `/api/reports/send`

**Protected endpoint** - Requires `x-cron-secret` header.

**Request:**
```bash
curl -X POST https://your-vercel-domain/api/reports/send \
  -H "x-cron-secret: YOUR_CRON_SECRET"
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Rapport envoyé avec succès",
  "timestamp": "2024-01-15T10:45:30.123Z"
}
```

**Response (Unauthorized):**
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

---

### POST `/api/reports/test`

**Unprotected endpoint** - For manual testing (no secret required).

**Request:**
```bash
curl -X POST http://localhost:3000/api/reports/test
```

**Response:**
```json
{
  "success": true,
  "message": "Rapport de test envoyé",
  "data": {
    "collectesEnAttente": 5,
    "collectesEnCours": 2,
    "collectesRestantes": 5,
    "totalAbonnements": 150,
    "montantEncaisse": 450000,
    "resteEncaisser": 120000,
    "generatedAt": "2024-01-15T10:45:30.123Z"
  },
  "timestamp": "2024-01-15T10:45:30.123Z"
}
```

---

## Email Template

The email is sent as HTML with inline CSS and includes:

- Header with "RAPPORT NAKOWA" branding
- Collectes section (3 statistics)
- Abonnements & Paiements section (3 statistics)
- Footer with generation timestamp

The template is responsive and compatible with Gmail, Outlook, Apple Mail, and other email clients.

---

## Future Enhancements

- [ ] Add support for scheduled report customization
- [ ] Store report history in the database
- [ ] Add report delivery failure alerts
- [ ] Support multiple cron schedules for different reports
- [ ] Add chart/graph images to the email (requires image generation library)

---

## Support

For issues, check:
1. Vercel deployment logs
2. Backend application logs (use `npm run start:dev` locally to debug)
3. Email provider documentation (Gmail App Passwords, etc.)
4. Cron schedule syntax at [cron.help](https://cron.help)

---

**Last Updated:** 2024-01-15  
**Feature Status:** ✅ Production Ready
