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
// Default express.json() body limit is 100kb, which is far too small once a
// complaint includes a base64-encoded photo (even one modest photo is
// commonly several hundred KB to a few MB as base64 text). Without raising
// this, every complaint submitted with a photo attached fails immediately
// with "413 Payload Too Large" before it ever reaches a route handler.
app.use(express.json({ limit: '15mb' }));

const JWT_SECRET = process.env.JWT_SECRET || 'local-dev-secret-not-for-production';

// In-memory user store: email -> user record
const users = new Map();

// In-memory complaint store: id -> complaint record
const complaints = new Map();

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

// ---- Complaints (real in-memory storage + simulated AI classification) ----
// This is a lightweight stand-in for the real server's AI pipeline (which
// needs Prisma/Postgres — not available in this environment). It actually
// stores what's submitted and returns a plausible, deterministic
// classification instead of an empty object, so the "Model Output" panel in
// the UI has something real to show instead of hanging on "still running".

function currentUser(req) {
  const token = getBearerToken(req);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return users.get(decoded.email) || null;
  } catch {
    return null;
  }
}

const URGENT_WORDS = ['danger', 'urgent', 'fire', 'accident', 'injur', 'collapse', 'leak', 'electrocut', 'flood'];

function classifyComplaint(description, category) {
  const text = (description || '').toLowerCase();
  const isUrgent = URGENT_WORDS.some((w) => text.includes(w));
  const isDetailed = text.length >= 120;

  const priority = isUrgent ? 'HIGH' : isDetailed ? 'MEDIUM' : 'LOW';
  const priority_confidence = isUrgent ? 0.91 : isDetailed ? 0.78 : 0.64;
  const validity = text.length >= 20 ? 'VALID' : 'NEEDS_REVIEW';
  const validity_confidence = text.length >= 20 ? 0.88 : 0.55;
  const trust_score = Math.min(0.97, 0.6 + Math.min(text.length, 300) / 1000 + (isUrgent ? 0.1 : 0));

  return {
    validity,
    validity_confidence,
    priority,
    priority_confidence,
    trust_score: Number(trust_score.toFixed(2)),
    category_predicted: category || 'General',
  };
}

app.post('/api/complaints', (req, res) => {
  const user = currentUser(req);
  if (!user) return res.status(401).json({ success: false, message: 'Not authenticated', data: null });

  const { title, description, priority, category, subCategory, attachments } = req.body || {};
  if (!description || !description.trim()) {
    return res.status(400).json({ success: false, message: 'Description is required', data: null });
  }

  const id = randomUUID();
  const now = new Date().toISOString();
  const prediction = classifyComplaint(description, category);

  const complaint = {
    id,
    title: title || `${category || 'Complaint'} report`,
    description,
    status: 'submitted',
    priority: priority || prediction.priority.toLowerCase(),
    createdAt: now,
    updatedAt: now,
    department: { id: 'dept-1', name: routeDepartment(category) },
    prediction: { ...prediction, status: 'COMPLETE' },
    aiModelOutputs: [
      {
        id: randomUUID(),
        modelName: 'MODEL_1_AUTHENTICITY_PRIORITY',
        status: 'COMPLETE',
        confidenceScore: prediction.validity_confidence,
        aiRecommendation: prediction.priority === 'HIGH' ? 'Escalate immediately' : 'Route to department queue',
        priorityScore: prediction.priority_confidence,
        classification: prediction.validity,
        priorityLevel: prediction.priority,
        processedOutput: prediction,
      },
    ],
    attachments: (attachments || []).map((a) => ({
      id: randomUUID(),
      fileUrl: a.fileUrl,
      fileName: a.fileName || null,
      createdAt: now,
    })),
    feedback: [],
    predictions: [
      {
        validity: prediction.validity,
        validityConfidence: prediction.validity_confidence,
        priority: prediction.priority,
        priorityConfidence: prediction.priority_confidence,
        trustScore: prediction.trust_score,
      },
    ],
    statusHistory: [{ id: randomUUID(), oldStatus: null, newStatus: 'submitted', createdAt: now }],
    ownerEmail: user.email,
    subCategory: subCategory || null,
    whatsappNotification: { sent: false, reason: 'WhatsApp notifications are not configured in this demo environment.' },
  };

  complaints.set(id, complaint);
  res.json(ok(complaint));
});

app.get('/api/complaints/:id', (req, res) => {
  const complaint = complaints.get(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found', data: null });
  res.json(ok(complaint));
});

app.get('/api/complaints', (req, res) => {
  const user = currentUser(req);
  const all = Array.from(complaints.values())
    .filter((c) => !user || c.ownerEmail === user.email)
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const start = (page - 1) * limit;
  const items = all.slice(start, start + limit);

  res.json(ok({
    items,
    pagination: { page, limit, total: all.length, totalPages: Math.max(1, Math.ceil(all.length / limit)) },
  }));
});

function routeDepartment(category) {
  const c = (category || '').toLowerCase();
  if (c.includes('infrastructure') || c.includes('road')) return 'Public Works';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('sanitation')) return 'Sanitation';
  if (c.includes('law') || c.includes('safety')) return 'Public Safety';
  return 'Civic Services';
}

// Generic catch-all for any other /api/* GET/POST -> empty success envelope
app.use('/api', (req, res) => {
  res.json(ok({}));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Mock API (with simple auth) listening on', port));
