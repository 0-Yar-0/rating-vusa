require('dotenv').config();
const express = require('express');
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('@prisma/client');
const { prisma } = require('./db');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());
app.use(cookieParser());

app.set('trust proxy', 1);

// Support multiple allowed client origins (comma-separated in CLIENT_ORIGIN)
const CLIENT_ORIGINS = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim().replace(/\/$/, '')) // remove trailing slash
  .filter(Boolean);

function isOriginAllowed(origin) {
  if (!origin) return true; // allow non-browser/server-to-server requests
  const cleaned = origin.replace(/\/$/, '');
  if (CLIENT_ORIGINS.includes('*')) return true;
  if (CLIENT_ORIGINS.includes(cleaned)) return true;
  try {
    const url = new URL(cleaned);
    const hostname = url.hostname; // e.g. my-app.onrender.com

    // direct matches with host or origin
    if (CLIENT_ORIGINS.includes(hostname)) return true;
    if (CLIENT_ORIGINS.includes(url.origin)) return true;

    // allow domain entries like `.example.com` to match subdomains
    for (const allowed of CLIENT_ORIGINS) {
      if (!allowed) continue;
      if (allowed.startsWith('.')) {
        if (hostname.endsWith(allowed)) return true;
      }
      // allow entries like 'example.com' to match subdomains
      if (hostname === allowed || hostname.endsWith('.' + allowed)) return true;
    }
  } catch (e) {
    // If parsing fails, fall back to strict compare (already checked)
  }
  return false;
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (isOriginAllowed(origin)) return callback(null, true);
      console.warn('Blocked CORS origin:', origin, 'allowed:', CLIENT_ORIGINS);
      return callback(new Error(`CORS policy does not allow access from the specified Origin: ${origin}`), false);
    },
    credentials: true,
  })
);

const pgPool = new (require('pg')).Pool({ connectionString: process.env.DATABASE_URL });

const cookieSameSite = process.env.COOKIE_SAME_SITE || (process.env.NODE_ENV === 'production' ? 'none' : 'lax');
const cookieDomain = process.env.COOKIE_DOMAIN || undefined;
const cookieSecure = process.env.COOKIE_SECURE ? process.env.COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production';

const sessionMiddleware = session({
  store: new pgSession({ pool: pgPool, tableName: 'session' }),
  name: process.env.SESSION_COOKIE_NAME || 'sid',
  secret: process.env.SESSION_SECRET || 'change-me',
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    secure: cookieSecure,
    httpOnly: true,
    sameSite: cookieSameSite,
    domain: cookieDomain,
  },
});

app.use(sessionMiddleware);

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
  const frontend = process.env.CLIENT_ORIGIN || '';
  if (frontend) {
    return res.redirect(frontend);
  }
  return res.send(`<html><body><h1>Rating University Backend</h1><p>Service is running.</p><p>Endpoints: <a href="/health">/health</a>, <a href="/api/auth">/api/auth</a></p></body></html>`);
});

app.get('/health', (req, res) => res.json({ ok: true }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

module.exports = app;
