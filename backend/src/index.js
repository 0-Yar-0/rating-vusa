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
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (curl, server-to-server) with no origin
      if (!origin) return callback(null, true);
      if (CLIENT_ORIGINS.includes(origin)) return callback(null, true);
      return callback(new Error('CORS policy does not allow access from the specified Origin.'), false);
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

app.get('/health', (req, res) => res.json({ ok: true }));

if (require.main === module) {
  app.listen(PORT, () => console.log(`Server listening on ${PORT}`));
}

module.exports = app;
