const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');

const app = express();

// Allow the deployed frontend origin(s) via env var, plus localhost for dev.
// Set CLIENT_ORIGIN on Render to your Vercel URL, e.g.
//   CLIENT_ORIGIN=https://your-app.vercel.app
// Multiple origins can be comma-separated.
const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  ...String(process.env.CLIENT_ORIGIN || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean),
]);

app.use(
  cors({
    origin(origin, callback) {
      // allow no-origin requests (curl, health checks) and any allowed origin
      if (!origin || allowedOrigins.has(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    exposedHeaders: ['set-auth-jwt'],
  })
);
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-not-for-production';

// In-memory user store: email -> user record
const users = new Map();

function ok(data, message = "OK") {
  return { success: true, message, data };
}
function fail(res, status, message) {
  return res.status(status).json({ success: false, message, data: null });
}

function toPublicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: true,
    image: null,
  };
}

function signToken(u) {
  return jwt.sign(
    {
      sub: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      email_verified: true,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function getBearerToken(req) {
  const h = req.headers.authorization || '';
  const m = h.match(/^Bearer (.+)$/);
  return m ? m[1] : null;
}

// ---- Simple Auth (replaces Neon Auth) ----
const authRouter = express.Router();

authRouter.post('/sign-up/email', async (req, res) => {
  const { email, password, name } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  if (users.has(email.toLowerCase())) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: randomUUID(),
    name,
    email: email.toLowerCase(),
    role: 'citizen',
    passwordHash,
  };
  users.set(user.email, user);
  const token = signToken(user);
  res.setHeader('set-auth-jwt', token);
  res.json({ user: toPublicUser(user), session: { token } });
});

authRouter.post('/sign-in/email', async (req, res) => {
  const { email, password } = req.body || {};
  const user = users.get((email || '').toLowerCase());
  if (!user) return res.status(401).json({ message: 'Invalid email or password' });
  const match = await bcrypt.compare(password || '', user.passwordHash);
  if (!match) return res.status(401).json({ message: 'Invalid email or password' });
  const token = signToken(user);
  res.setHeader('set-auth-jwt', token);
  res.json({ user: toPublicUser(user), session: { token } });
});

authRouter.post('/sign-in/social', (req, res) => {
  // No real OAuth provider wired up in this local/dev environment
  res.status(501).json({ message: 'Social sign-in is not available in this environment' });
});

authRouter.get('/get-session', (req, res) => {
  const token = getBearerToken(req);
  if (!token) return res.status(401).json(null);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = users.get(decoded.email);
    if (!user) return res.status(401).json(null);
    res.json({ user: toPublicUser(user), session: { token } });
  } catch {
    res.status(401).json(null);
  }
});

authRouter.post('/sign-out', (req, res) => {
  res.json({ ok: true });
});

authRouter.post('/email-otp/verify-email', (req, res) => {
  // OTP step isn't used by the current UI flow — accept trivially.
  res.json({ ok: true });
});

app.use('/api/simple-auth', authRouter);

// health
app.get('/api/health', (req, res) => res.json(ok({ status: 'ok' })));

// Generic catch-all for any other /api/* GET/POST -> empty success envelope
app.use('/api', (req, res) => {
  res.json(ok({}));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Mock API (with simple auth) listening on', port));
