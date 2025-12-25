require('dotenv').config();
const { execSync } = require('child_process');
const { prisma } = require('./db');
const app = require('./index');

async function ensureSessionTable(pgPool) {
  // create session table if not exists (simple implementation)
  const createSql = `CREATE TABLE IF NOT EXISTS "session" (
    sid varchar PRIMARY KEY,
    sess json NOT NULL,
    expire timestamp(6) NOT NULL
  );`;
  try {
    await pgPool.query(createSql);
    console.log('Ensured session table exists');
  } catch (e) {
    console.warn('Could not ensure session table:', e.message, e && e.stack);
  }
}

async function waitForDb(retries = 30, delayMs = 2000) {
  const { Pool } = require('pg');

  const rawDb = process.env.DATABASE_URL;
  console.log('DATABASE_URL present:', !!rawDb, 'type:', typeof rawDb);
  if (typeof rawDb === 'string') {
    console.log('DATABASE_URL preview:', rawDb.slice(0, 80) + (rawDb.length > 80 ? '...' : ''));
  } else if (!rawDb) {
    console.error('DATABASE_URL is not set. Set it in Render Environment or use Supabase and paste the connection string into DATABASE_URL. Exiting.');
    return false;
  } else {
    console.error('DATABASE_URL has unexpected type:', typeof rawDb, 'value:', String(rawDb));
    return false;
  }

  // Provide an SSL fallback for hosts like Supabase which require TLS
  const poolOptions = { connectionString: rawDb };
  try {
    if (rawDb.includes && rawDb.includes('sslmode=require')) {
      poolOptions.ssl = { rejectUnauthorized: false };
    } else if (process.env.NODE_ENV === 'production') {
      // For production, enable SSL to be safe (rejectUnauthorized false to work with managed DBs)
      poolOptions.ssl = { rejectUnauthorized: false };
    }
  } catch (err) {
    console.warn('Could not parse DATABASE_URL for SSL detection, proceeding without explicit ssl option:', err && err.message);
  }

  const pool = new Pool(poolOptions);
  for (let i = 1; i <= retries; i++) {
    try {
      await pool.query('SELECT 1');
      await pool.end();
      console.log('Database is ready');
      return true;
    } catch (e) {
      console.log(`Database not ready (attempt ${i}/${retries}): ${e.message}`);
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }
  try { await pool.end(); } catch (e) {}
  console.error('Database did not become ready in time');
  return false;
}

async function runMigrations() {
  const autoMigrate = process.env.AUTO_MIGRATE === 'true';
  const autoPush = process.env.AUTO_DB_PUSH === 'true';

  try {
    if (autoMigrate) {
      console.log('Running `prisma migrate deploy` (AUTO_MIGRATE=true)');
      execSync('npx prisma migrate deploy', { stdio: 'inherit' });
    } else if (autoPush) {
      console.log('Running `prisma db push` (AUTO_DB_PUSH=true)');
      execSync('npx prisma db push', { stdio: 'inherit' });
    } else {
      console.log('No automatic migration configured (set AUTO_MIGRATE or AUTO_DB_PUSH)');
    }
  } catch (e) {
    console.error('Migration command failed:', e.message);
  }
}

async function main() {
  // Wait for DB to be ready
  const ok = await waitForDb(30, 2000);
  if (!ok) {
    console.error('Exiting: database not ready');
    process.exit(1);
  }

  // Run migrations/push if configured
  await runMigrations();

  // Ensure session table exists via a direct connection
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await ensureSessionTable(pool);

  // Initialize app with the pool and start server
  const { app, setupApp } = require('./index');
  setupApp(pool);

  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

main().catch((e) => {
  console.error('Startup failed:', e);
  process.exit(1);
});