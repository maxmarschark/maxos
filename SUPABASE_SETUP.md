# Supabase setup for Max OS

Max OS currently stores all CRM data in **localStorage**. This guide sets up **Supabase** as the cloud persistence layer while keeping localStorage as the active fallback until sync is wired into the app providers.

## Overview

| Piece | Location |
|-------|----------|
| Database schema | [`supabase/schema.sql`](./supabase/schema.sql) |
| Supabase client | [`src/lib/supabase/client.js`](./src/lib/supabase/client.js) |
| Env helpers | [`src/lib/supabase/env.js`](./src/lib/supabase/env.js) |
| localStorage → Supabase migration | [`src/lib/supabase/migrateLocalStorage.js`](./src/lib/supabase/migrateLocalStorage.js) |

When `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are **not** set, the app behaves exactly as before (localStorage only). The Supabase client returns `null` and nothing breaks.

---

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a project.
2. Wait for the database to finish provisioning.
3. Open **Project Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

---

## 2. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Restart the dev server after changing `.env`:

```bash
npm run dev
```

`.env` is gitignored. Never commit real keys.

---

## 3. Run the database schema

1. In Supabase, open **SQL Editor → New query**.
2. Paste the contents of [`supabase/schema.sql`](./supabase/schema.sql).
3. Click **Run**.

This creates these tables (all scoped per user via Row Level Security):

| Table | Purpose |
|-------|---------|
| `accounts` | Retail / wholesale accounts |
| `brands` | Brand partners |
| `brand_products` | Products (normalized from `brands.products` in localStorage) |
| `contacts` | People linked to accounts/brands |
| `orders` | Orders |
| `commissions` | Commission metadata per order |
| `tasks` | Tasks & follow-ups |
| `activity_events` | Materialized timeline events for sync |

Each row includes `user_id` referencing `auth.users`. RLS policies allow access only when `auth.uid() = user_id`.

---

## 4. Enable authentication (required for upload)

Migration upload uses the signed-in Supabase user as `user_id`.

1. In Supabase, open **Authentication → Providers**.
2. Enable **Email** (or another provider you prefer).
3. Create a user account you will use for Max OS sync.

The app does not include a login UI yet. For now, sign in programmatically or via the Supabase dashboard while testing upload (see step 6).

### Accounts module (cloud sync)

The **Accounts** module reads/writes Supabase when configured. On startup it:

1. Attempts an anonymous Supabase session (`signInAnonymously`)
2. Fetches accounts from the `accounts` table
3. Falls back to localStorage if auth, schema, or network fails

**Enable anonymous auth** for cloud Accounts (recommended):

1. Supabase → **Authentication → Providers**
2. Enable **Anonymous sign-ins**

**If Anonymous sign-in is disabled**, use one of these instead:

- Set `VITE_SUPABASE_EMAIL` and `VITE_SUPABASE_PASSWORD` in `.env` (create a user in Supabase Auth first), **or**
- Run [`supabase/accounts-cloud-access.sql`](./supabase/accounts-cloud-access.sql) in the SQL editor to allow publishable-key access

The Accounts page header shows **CLOUD** when connected, **LOCAL** when using the fallback.
Check the browser console for `[Max OS Accounts] CLOUD` or `[Max OS Accounts] LOCAL` messages.

Other modules (Brands, Contacts, Orders, Tasks, Commissions, Today) remain on localStorage.

---

## 5. Migrate existing localStorage data

The migration utility reads the same keys as backup/restore:

- `max-os-accounts`
- `max-os-contacts`
- `max-os-brands`
- `max-os-orders`
- `max-os-commissions`
- `max-os-tasks`

### Export a migration JSON file (browser)

Open the app, then run in the browser console:

```javascript
import {
  downloadMigrationPayload,
  prepareMigrationPayload,
} from "/src/lib/supabase/index.js"

// Preview counts (replace with your Supabase user UUID after sign-in)
const payload = prepareMigrationPayload({ userId: "YOUR-USER-UUID" })
console.log(payload.counts)

// Download JSON for inspection / manual import
downloadMigrationPayload({ userId: "YOUR-USER-UUID" })
```

The exported JSON contains snake_case rows ready for Supabase, including precomputed `activity_events` from the relationship engine.

### Upload directly to Supabase

After schema + auth are configured and env vars are set:

```javascript
import { migrateLocalStorageToSupabase } from "/src/lib/supabase/index.js"

// Must be signed in to Supabase (session present)
const result = await migrateLocalStorageToSupabase({
  userId: "YOUR-USER-UUID", // optional; validated against session
  onTableComplete: ({ table, count }) => console.log(`Uploaded ${count} → ${table}`),
})

console.log(result)
```

Upload order respects foreign keys: brands → accounts → brand_products → contacts → orders → commissions → tasks → activity_events.

---

## 6. Verify data in Supabase

1. Open **Table Editor** in Supabase.
2. Confirm row counts match the migration `counts` object.
3. Spot-check relationships (e.g. `orders.account_id` → `accounts.id`).

---

## 7. Current app behavior (important)

**localStorage is still the source of truth.** Providers (`AccountsProvider`, `OrdersProvider`, etc.) have not been switched to Supabase yet.

| Status | Behavior |
|--------|----------|
| Env vars missing | localStorage only (unchanged) |
| Env vars set | Client available; app still uses localStorage |
| Migration utility | Export JSON or upload when authenticated |

Future work (not in this phase):

- Auth UI in Max OS
- Read/write adapters that prefer Supabase with localStorage fallback
- Real-time sync and conflict resolution

---

## Troubleshooting

### `Supabase is not configured`

Set both `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` and restart Vite.

### RLS / permission errors on upload

- Ensure you ran `supabase/schema.sql` completely.
- Sign in before calling `uploadMigrationPayload` / `migrateLocalStorageToSupabase`.
- Confirm `user_id` in the payload matches `auth.uid()`.

### Foreign key errors

Upload uses a fixed table order. If you inserted rows manually, clear tables and re-run migration, or upload the full payload via the utility.

### Schema changes

Edit `supabase/schema.sql` and apply changes in the SQL Editor. Bump `MIGRATION_FORMAT_VERSION` in `migrateLocalStorage.js` if the export shape changes.

---

## API reference (migration)

```javascript
import {
  isSupabaseConfigured,
  getSupabaseClient,
  readLocalStorageForMigration,
  prepareMigrationPayload,
  downloadMigrationPayload,
  uploadMigrationPayload,
  migrateLocalStorageToSupabase,
} from "./src/lib/supabase/index.js"
```

| Function | Description |
|----------|-------------|
| `isSupabaseConfigured()` | `true` when both env vars are set |
| `getSupabaseClient()` | Supabase client or `null` |
| `readLocalStorageForMigration()` | Raw app data from localStorage |
| `prepareMigrationPayload({ userId })` | Transform to Supabase row format |
| `downloadMigrationPayload({ userId })` | Browser download of migration JSON |
| `uploadMigrationPayload(payload)` | Upsert all tables (requires auth) |
| `migrateLocalStorageToSupabase(options)` | Read → transform → upload |
