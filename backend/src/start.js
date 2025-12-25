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
    console.warn('Could not ensure session table:', e.message);
  }
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
  // Run migrations/push if configured
  await runMigrations();

  // Ensure session table exists via a direct connection
  const { Pool } = require('pg');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  await ensureSessionTable(pool);
  await pool.end();

  // Start server
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

main().catch((e) => {
  console.error('Startup failed:', e);
  process.exit(1);
});