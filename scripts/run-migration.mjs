#!/usr/bin/env node
// =============================================================================
// Run Supabase migration using the REST API (pg-meta)
// Usage: node scripts/run-migration.mjs
// =============================================================================

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Read .env manually (no extra deps needed)
const envPath = resolve(__dirname, '..', '.env');
const envContent = readFileSync(envPath, 'utf-8');
const env = {};
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

// Read migration file
const migrationPath = resolve(__dirname, '..', 'supabase', 'migrations', '20260224000000_add_projects.sql');
const sql = readFileSync(migrationPath, 'utf-8');

console.log('Running migration: 20260224000000_add_projects.sql');
console.log(`Target: ${SUPABASE_URL}`);

// Execute via Supabase PostgREST rpc or pg-meta
// Using the /rest/v1/rpc endpoint won't work for DDL, so we use pg-meta
const projectRef = SUPABASE_URL.match(/https:\/\/([^.]+)/)?.[1];

const response = await fetch(`https://${projectRef}.supabase.co/pg/query`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    'x-connection-encrypted': 'true',
  },
  body: JSON.stringify({ query: sql }),
});

if (!response.ok) {
  // Try alternative: use the postgres REST endpoint
  console.log('pg/query not available, trying alternative approach...');

  // Split SQL into individual statements and run via rpc
  // Actually, let's try the Supabase management API
  const mgmtResponse = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!mgmtResponse.ok) {
    const errText = await mgmtResponse.text();
    console.error(`Migration failed (${mgmtResponse.status}):`, errText);
    console.log('\n--- Alternative: Run this SQL manually in Supabase SQL Editor ---');
    console.log('Go to: https://supabase.com/dashboard/project/' + projectRef + '/sql/new');
    console.log('Then paste the contents of: supabase/migrations/20260224000000_add_projects.sql');
    process.exit(1);
  }

  const mgmtResult = await mgmtResponse.json();
  console.log('Migration completed successfully!', mgmtResult);
  process.exit(0);
}

const result = await response.json();
if (result.error) {
  console.error('Migration error:', result.error);
  process.exit(1);
}

console.log('Migration completed successfully!');
