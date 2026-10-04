# Database Setup Guide - Nakowa MVP

## Overview

This guide covers setting up PostgreSQL database for the Nakowa MVP, including both local development and Supabase cloud options.

## Option 1: Supabase Setup (Recommended for MVP)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login
3. Click "New Project"
4. Choose organization and enter:
   - Name: `nakowa-mvp`
   - Database Password: (generate strong password)
   - Region: Choose closest to Niger (Europe West recommended)

### Step 2: Get Connection String

1. Go to Settings → Database
2. Copy the connection string
3. Replace `[YOUR-PASSWORD]` with your database password
4. Update `.env` file:

```env
DATABASE_URL="postgresql://postgres.[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
```

### Step 3: Run Migrations

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed initial data
npm run db:seed
```

## Option 2: Local PostgreSQL Setup

### Step 1: Install PostgreSQL

**macOS (Homebrew):**
```bash
brew install postgresql
brew services start postgresql
```

**Ubuntu/Debian:**
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
```

### Step 2: Create Database

```bash
# Connect to PostgreSQL
psql postgres

# Create database and user
CREATE DATABASE nakowa_dev;
CREATE USER nakowa_user WITH PASSWORD 'nakowa_password';
GRANT ALL PRIVILEGES ON DATABASE nakowa_dev TO nakowa_user;
\q
```

### Step 3: Update Environment

```env
DATABASE_URL="postgresql://nakowa_user:nakowa_password@localhost:5432/nakowa_dev"
```

### Step 4: Run Migrations

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Database Schema

### Tables Created

1. **users** - System users (ADMIN/AGENT)
2. **clients** - Customer information with geolocation
3. **services** - Available services (Vidange, Nettoyage, etc.)
4. **interventions** - Service appointments and tracking
5. **payments** - Payment records with automatic calculations
6. **activity_logs** - Audit trail for all operations

### Key Features

- **UUIDs** for all primary keys
- **Soft deletes** via `is_active` fields
- **Timestamps** for creation/modification tracking
- **Geolocation** support for clients
- **Payment status** auto-calculation
- **Activity logging** for audit trails

## Default Data

After seeding, you'll have:

### Users
- Admin: `admin@nakowa.com` / `admin123`
- Agent: `agent@nakowa.com` / `agent123`

### Services
- Vidange
- Nettoyage
- Assainissement
- Curage

### Sample Clients
- 3 clients with Niamey coordinates
- Ready for map testing

## Common Commands

```bash
# View database in browser
npm run db:studio

# Reset database (careful!)
npm run db:reset

# Generate new migration
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy
```

## Health Checks

Once running, check:
- API Health: `GET /api/health`
- Database Health: `GET /api/health/database`

## Troubleshooting

### Connection Issues

1. **Supabase**: Check project status and connection string
2. **Local**: Ensure PostgreSQL is running
3. **Firewall**: Check ports 5432 (PostgreSQL) and 3000 (API)

### Migration Issues

```bash
# Reset and regenerate
npm run db:reset
npm run db:generate
npm run db:push
npm run db:seed
```

### Seed Failures

- Check if tables exist
- Verify unique constraints
- Check data format

## Production Considerations

- Use strong passwords
- Enable SSL connections
- Regular backups
- Monitor connection pools
- Set up read replicas if needed

## Backup Strategy

### Supabase
- Automatic daily backups included
- Download via dashboard
- Point-in-time recovery available

### Local PostgreSQL
```bash
# Backup
pg_dump nakowa_dev > backup_$(date +%Y%m%d).sql

# Restore
psql nakowa_dev < backup_20241221.sql
```

## Security Notes

- Never commit `.env` files
- Use connection pooling in production
- Implement proper RBAC
- Regular security updates
- Monitor access logs