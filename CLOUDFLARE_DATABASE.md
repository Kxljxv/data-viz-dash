# Cloudflare Database Implementation Documentation

This document describes the implementation of Cloudflare D1 for the Data Visualization Dashboard, replacing local SQLite files in production to bypass Cloudflare Pages' 25MB asset limit.

## Overview

Cloudflare Pages has a strict limit of **25MB per file**. The project's SQLite databases (`amendments.sqlite` and `persons.sqlite`) frequently exceed this limit, causing build failures. 

To resolve this, we migrated the production data storage to **Cloudflare D1**, a serverless SQL database. Local SQLite files are preserved for development purposes but are stripped during the production build process.

## 1. Configuration

### D1 Binding
The database is bound to the application using the binding name `AEA_DB`.

- **Database Name**: `aea-data`
- **Database ID**: `0f846c1b-4a0f-4cdc-bbd1-c7b4c57d49c8`

This is configured in both:
- [wrangler.jsonc](file:///c:/Users/kolja/Desktop/data-viz-dash/wrangler.jsonc) (for Cloudflare Pages)
- [wrangler.toml](file:///c:/Users/kolja/Desktop/data-viz-dash/wrangler.toml) (for Workers/Local CLI compatibility)

```json
"d1_databases": [
  {
    "binding": "AEA_DB",
    "database_name": "aea-data",
    "database_id": "0f846c1b-4a0f-4cdc-bbd1-c7b4c57d49c8"
  }
]
```

## 2. API Implementation

The database access logic is centralized in the API route:
[+server.js](file:///c:/Users/kolja/Desktop/data-viz-dash/src/routes/api/database/+server.js)

### Dual-Mode Operation
The API automatically detects the environment:
1. **Production (Cloudflare)**: Uses `platform.env.AEA_DB` to query D1.
2. **Development (Local)**: Falls back to `better-sqlite3` and reads from `static/data/database/*.sqlite`.

### Fallback Logic
If D1 is present but fails (e.g., during initialization), the code attempts a local fallback to ensure service continuity.

## 3. Build-Time Asset Scrubbing

To prevent oversized SQLite files from reaching the Cloudflare deployment (which would trigger a 25MB limit error), a post-build script is used.

### Script: `scripts/strip-large-assets.mjs`
This script [strip-large-assets.mjs](file:///c:/Users/kolja/Desktop/data-viz-dash/scripts/strip-large-assets.mjs) runs after the Vite build. It:
1. Scans the `.svelte-kit/cloudflare` directory.
2. Deletes any file with `.sqlite`, `.sqlite3`, or `.db` extensions.
3. Deletes any file exceeding 25MB.

### Integration in `package.json`
The script is hooked into the build command:
```json
"build": "vite build && node scripts/strip-large-assets.mjs"
```

## 4. Data Migration

Since D1 is a separate cloud database, data from local SQLite files must be synchronized manually using the provided migration script.

### Step 1: Generate SQL Dump
Run the migration script to convert local SQLite data into a D1-compatible SQL file:
```bash
node scripts/d1-migrate.mjs
```
This creates `d1-import.sql` in the project root.

### Step 2: Upload to Cloudflare D1
Use the Wrangler CLI to execute the SQL against the remote database:
```bash
npx wrangler d1 execute aea-data --remote --file=./d1-import.sql
```

## 5. Development Workflow

- **Adding Data**: Update the local SQLite files in `static/data/database/`.
- **Testing**: Run `npm run dev`. The app will use the local files.
- **Deploying**:
  1. Generate a new `d1-import.sql`.
  2. Execute the import to D1 (see Step 2 above).
  3. Push changes to GitHub; Cloudflare Pages will build and deploy using the new D1 data.

---
**Note**: The local SQLite files are ignored by the build process but **should remain in the repository** for local development and as a source of truth for D1 migrations.
