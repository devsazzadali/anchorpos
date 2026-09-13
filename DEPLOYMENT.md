# DATABYTE POS — Deployment Guide

## Prerequisites

- Node.js 20+
- Supabase project (cloud or self-hosted)
- Vercel account (for deployment)
- GitHub repository

---

## 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

Required variables:
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key (safe for browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (SERVER ONLY) |
| `NEXT_PUBLIC_APP_NAME` | Application display name |
| `NEXT_PUBLIC_CURRENCY_SYMBOL` | e.g. `৳` for BDT |
| `NEXT_PUBLIC_TIMEZONE` | e.g. `Asia/Dhaka` |

---

## 2. Supabase Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Initialize (run once)
supabase init

# Link to your cloud project
supabase link --project-ref YOUR_PROJECT_REF

# Apply all database migrations
supabase db push

# Generate TypeScript types
npm run db:types

# Verify RLS is enabled on all tables (run in Supabase SQL editor)
# SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
```

---

## 3. Local Development

```bash
npm install
npm run dev
# App available at http://localhost:3000
```

---

## 4. Run Tests

```bash
# Unit tests
npm run test:unit

# Unit tests (watch mode)
npm run test:unit:watch

# E2E tests (requires running dev server)
npm run test:e2e

# All checks
npm run test:all
```

---

## 5. Vercel Deployment

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# First-time setup (follow prompts)
vercel

# Set environment variables on Vercel
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add NEXT_PUBLIC_APP_NAME production
vercel env add NEXT_PUBLIC_CURRENCY_SYMBOL production
vercel env add NEXT_PUBLIC_TIMEZONE production

# Deploy to production
vercel --prod
```

---

## 6. GitHub Actions CI/CD

Add these secrets to your GitHub repository (`Settings → Secrets → Actions`):

| Secret | Description |
|---|---|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon key |
| `VERCEL_TOKEN` | Vercel API token |
| `VERCEL_ORG_ID` | Vercel organization ID |
| `VERCEL_PROJECT_ID` | Vercel project ID |
| `E2E_TEST_EMAIL` | Test user email for E2E |
| `E2E_TEST_PASSWORD` | Test user password for E2E |

The pipeline:
- Every push to `main`/`develop`: type-check → lint → unit tests → build
- Every PR to `main`: + preview deploy
- Merge to `main`: + E2E tests → production deploy

---

## 7. Post-Deployment Checklist

- [ ] Visit production URL, verify login works
- [ ] Test a complete POS sale online
- [ ] Test POS sale offline (DevTools → Network → Offline)
- [ ] Re-online → verify sync works
- [ ] Test receipt print (80mm thermal)
- [ ] Test barcode scanner (USB HID)
- [ ] Verify all reports load correctly
- [ ] Run Lighthouse audit on `/home` (target: >90 performance)
- [ ] Check Supabase dashboard for RLS policy errors in logs
- [ ] Enable Supabase daily backups (30-day retention)
- [ ] Set up Supabase monitoring alerts

---

## 8. PWA Installation

The app is a Progressive Web App. To install:

**Desktop (Chrome/Edge):** Click the install icon in the address bar → Install

**Android:** Browser menu → "Add to Home Screen"

**iOS Safari:** Share → "Add to Home Screen"

The PWA works fully offline for POS operations via IndexedDB + Service Worker.
