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

// ---------------------------------------------------------------------------
// AI classification — ported from the real server's fallback heuristic
// (server/src/services/prediction.service.js: textHeuristics +
// predictModel1Heuristic). The real system calls two external FastAPI
// model services for this (MODEL_1_AUTHENTICITY_PRIORITY at POST /predict,
// MODEL_2_CLASSIFICATION_SEVERITY at POST /predict-department) and only
// falls back to this exact heuristic when those services are unreachable.
// Since this demo has no such model services deployed, we run the
// heuristic path every time — but keep it faithful to the real logic and
// field names, so swapping in the real FASTAPI_URL/MODEL2_URL later is a
// drop-in change, not a rewrite.
//
// Improvements made over the original heuristic:
//  - Department keyword coverage expanded from 4 categories to all 6 used
//    by this app (added Law & Order, Public Services / Civic Services),
//    plus common Hindi/Hinglish terms citizens actually type.
//  - Department routing now returns a full probability distribution
//    (softmax over keyword-match scores) instead of a single guess, same
//    shape the real Model 2's `probabilities` field is meant to hold.
//  - Added estimatedResolutionHours / estimatedResolvedAt, matching the
//    real ResolutionPrediction the AI orchestrator writes.
// ---------------------------------------------------------------------------

const DEPARTMENT_TERMS = {
  'Electricity': ['light', 'electric', 'power', 'transformer', 'wire', 'shock', 'spark', 'bijli', 'current', 'streetlight'],
  'Water Supply': ['water', 'pipe', 'drain', 'leak', 'supply', 'tanker', 'paani', 'nal', 'tap'],
  'Sanitation': ['garbage', 'waste', 'sewage', 'sanitation', 'trash', 'kachra', 'gutter', 'drainage', 'dirty', 'smell'],
  'Roads & Transport': ['road', 'pothole', 'traffic', 'signal', 'bridge', 'footpath', 'sadak', 'gaddha', 'vehicle', 'bus stop'],
  'Public Services': ['certificate', 'record', 'document', 'office', 'registration', 'amenities', 'park', 'school', 'hospital'],
  'Law & Order': ['theft', 'crime', 'harassment', 'violence', 'safety', 'police', 'dispute', 'unsafe', 'threat'],
};

const CRITICAL_TERMS = ['fire', 'death', 'injury', 'hospital', 'electrocution', 'collapse', 'flood', 'sewage overflow', 'gas leak', 'accident'];
const HIGH_TERMS = ['urgent', 'danger', 'dangerous', 'blocked', 'contaminated', 'overflow', 'broken', 'no water', 'power outage', 'sparking'];
const SPAM_TERMS = ['buy now', 'lottery', 'crypto', 'http://', 'https://', 'free money'];

function softmax(scores) {
  const values = Object.values(scores);
  const max = Math.max(...values, 0);
  const exps = Object.fromEntries(Object.entries(scores).map(([k, v]) => [k, Math.exp(v - max)]));
  const sum = Object.values(exps).reduce((a, b) => a + b, 0) || 1;
  return Object.fromEntries(Object.entries(exps).map(([k, v]) => [k, v / sum]));
}

function textHeuristics(complaintText) {
  const text = String(complaintText || '').toLowerCase();

  const criticalHits = CRITICAL_TERMS.filter((term) => text.includes(term)).length;
  const highHits = HIGH_TERMS.filter((term) => text.includes(term)).length;
  const spamHits = SPAM_TERMS.filter((term) => text.includes(term)).length;

  const severityScore = Math.min(100, 35 + criticalHits * 25 + highHits * 12 + Math.min(text.length / 80, 20));
  const priorityLevel = severityScore >= 85 ? 'CRITICAL' : severityScore >= 65 ? 'HIGH' : severityScore >= 40 ? 'MEDIUM' : 'LOW';

  // Score every department by keyword hits, then turn that into a proper
  // probability distribution (this is the "improvement" over the real
  // heuristic's single if/else chain, which could only ever pick one
  // department with no confidence signal).
  const deptScores = Object.fromEntries(
    Object.entries(DEPARTMENT_TERMS).map(([dept, terms]) => [dept, terms.filter((t) => text.includes(t)).length]),
  );
  const hasAnyDeptHit = Object.values(deptScores).some((v) => v > 0);
  const probabilities = hasAnyDeptHit
    ? softmax(deptScores)
    : softmax(Object.fromEntries(Object.keys(DEPARTMENT_TERMS).map((d) => [d, d === 'Public Services' ? 0.5 : 0])));
  const suggestedDepartment = Object.entries(probabilities).sort((a, b) => b[1] - a[1])[0][0];

  return {
    classification: suggestedDepartment,
    severity_score: Number(severityScore.toFixed(2)),
    severity_level: priorityLevel,
    emergency_level: priorityLevel === 'CRITICAL' ? 'Immediate' : priorityLevel === 'HIGH' ? 'Elevated' : 'Routine',
    suggested_department: suggestedDepartment,
    priority_level: priorityLevel,
    area_impact: criticalHits ? 'Multi-household or safety-sensitive impact possible' : highHits ? 'Localized impact likely' : 'Single-location impact likely',
    ai_remarks: `${priorityLevel} priority complaint routed to ${suggestedDepartment}.`,
    escalation_recommendation: ['CRITICAL', 'HIGH'].includes(priorityLevel) ? 'Escalate to duty supervisor and dispatch field verification.' : 'Route through normal officer queue.',
    fake_spam_risk: spamHits ? 'HIGH' : text.length < 12 ? 'MEDIUM' : 'LOW',
    confidence: Math.max(62, Math.min(96, 72 + criticalHits * 6 + highHits * 4 - spamHits * 12)),
    probabilities: Object.entries(probabilities)
      .map(([department, probability]) => ({ department, probability: Number(probability.toFixed(3)) }))
      .sort((a, b) => b.probability - a.probability),
  };
}

function predictModel1Heuristic(complaintText) {
  const heuristic = textHeuristics(complaintText);
  const spamRisk = String(heuristic.fake_spam_risk || '').toUpperCase();
  const validity = spamRisk === 'HIGH' ? 'Fake' : 'Authentic';
  const validityConfidence = spamRisk === 'HIGH' ? 82 : Math.min(94, Math.max(68, heuristic.confidence + 4));
  const priorityConfidence = Math.min(94, Math.max(65, heuristic.confidence));
  const trustScore = validity === 'Fake' ? 0.28 : Number(Math.min(0.97, Math.max(0.62, priorityConfidence / 100)).toFixed(3));

  return {
    validity,
    validity_confidence: Number(validityConfidence.toFixed(2)),
    priority: heuristic.priority_level,
    priority_confidence: Number(priorityConfidence.toFixed(2)),
    trust_score: trustScore,
  };
}

const PRIORITY_SCORE = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 95 };

function estimateResolutionHours(priority, severityScore = 50) {
  if (priority === 'CRITICAL') return 4;
  if (priority === 'HIGH') return severityScore >= 75 ? 8 : 12;
  if (priority === 'MEDIUM') return 48;
  return 96;
}

// Simulates the real AI orchestrator's background queue: the citizen gets
// an immediate heuristic triage synchronously (see POST /complaints below),
// then a couple of seconds later this "completes" the full two-model
// analysis — matching the real system's async UX instead of faking instant
// omniscient results.
function runAIOrchestrator(complaintId) {
  setTimeout(() => {
    const complaint = complaints.get(complaintId);
    if (!complaint) return;

    const text = `${complaint.title}. ${complaint.description}`;
    const model1 = predictModel1Heuristic(text);
    const heuristic = textHeuristics(text);
    const estimatedResolutionHours = estimateResolutionHours(model1.priority, heuristic.severity_score);

    complaint.aiModelOutputs = [
      {
        id: randomUUID(),
        modelName: 'MODEL_1_AUTHENTICITY_PRIORITY',
        modelVersion: '2.0.0-heuristic',
        status: 'COMPLETED',
        confidenceScore: model1.validity_confidence,
        priorityScore: PRIORITY_SCORE[model1.priority],
        priorityLevel: model1.priority,
        severityAnalysis: `Authenticity: ${model1.validity}; priority: ${model1.priority}.`,
        severityScore: PRIORITY_SCORE[model1.priority],
        emergencyLevel: model1.priority === 'CRITICAL' ? 'Immediate' : model1.priority === 'HIGH' ? 'Elevated' : 'Routine',
        estimatedResolutionHours,
        riskCategory: model1.validity === 'Fake' ? 'INTEGRITY_REVIEW' : model1.priority === 'CRITICAL' ? 'PUBLIC_SAFETY' : model1.priority === 'HIGH' ? 'SLA_RISK' : 'STANDARD',
        classification: model1.validity,
        spamRisk: model1.validity === 'Fake' ? 'HIGH' : 'LOW',
        aiRecommendation:
          model1.validity === 'Fake'
            ? 'Hold for authenticity review before dispatch.'
            : `Treat as ${model1.priority.toLowerCase()} priority and continue triage.`,
        escalationRecommendation: ['CRITICAL', 'HIGH'].includes(model1.priority) ? 'Escalate if officer assignment is delayed.' : 'No escalation required.',
        processedOutput: model1,
      },
      {
        id: randomUUID(),
        modelName: 'MODEL_2_CLASSIFICATION_SEVERITY',
        modelVersion: '1.0.0-heuristic',
        status: 'COMPLETED',
        confidenceScore: heuristic.confidence,
        priorityScore: PRIORITY_SCORE[heuristic.priority_level],
        priorityLevel: heuristic.priority_level,
        severityAnalysis: heuristic.ai_remarks,
        severityScore: heuristic.severity_score,
        emergencyLevel: heuristic.emergency_level,
        estimatedResolutionHours,
        suggestedDepartment: heuristic.suggested_department,
        riskCategory: heuristic.fake_spam_risk === 'HIGH' ? 'INTEGRITY_REVIEW' : heuristic.priority_level === 'CRITICAL' ? 'PUBLIC_SAFETY' : heuristic.priority_level === 'HIGH' ? 'SLA_RISK' : 'STANDARD',
        classification: heuristic.classification,
        areaImpact: heuristic.area_impact,
        spamRisk: heuristic.fake_spam_risk,
        aiRecommendation: heuristic.ai_remarks,
        escalationRecommendation: heuristic.escalation_recommendation,
        processedOutput: heuristic,
      },
    ];

    if (PRIORITY_SCORE[model1.priority] > PRIORITY_SCORE[complaint.priority?.toUpperCase()]) {
      complaint.priority = model1.priority.toLowerCase();
    }
    complaint.department = { id: 'dept-auto', name: heuristic.suggested_department };
    complaint.updatedAt = new Date().toISOString();
  }, 2500);
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
  const predictionText = `${title || category || 'Complaint'}. ${description}`;

  // Immediate heuristic triage — returned synchronously, same as the real
  // server's createComplaint() does before the background AI queue runs.
  const immediatePrediction = predictModel1Heuristic(predictionText);

  const complaint = {
    id,
    title: title || `${category || 'Complaint'} report`,
    description,
    status: 'submitted',
    priority: priority || immediatePrediction.priority.toLowerCase(),
    createdAt: now,
    updatedAt: now,
    department: { id: 'dept-pending', name: routeDepartment(category) },
    prediction: {
      complaint: predictionText,
      ...immediatePrediction,
      unavailable: false,
      fallbackUsed: true,
      message: 'Immediate AI triage generated',
    },
    predictions: [
      {
        validity: immediatePrediction.validity,
        validityConfidence: immediatePrediction.validity_confidence,
        priority: immediatePrediction.priority,
        priorityConfidence: immediatePrediction.priority_confidence,
        trustScore: immediatePrediction.trust_score,
      },
    ],
    // Populated a couple seconds later by runAIOrchestrator — the UI polls
    // for this, matching the real system's async model pipeline.
    aiModelOutputs: [],
    attachments: (attachments || []).map((a) => ({
      id: randomUUID(),
      fileUrl: a.fileUrl,
      fileName: a.fileName || null,
      createdAt: now,
    })),
    feedback: [],
    statusHistory: [{ id: randomUUID(), oldStatus: null, newStatus: 'submitted', createdAt: now }],
    ownerEmail: user.email,
    subCategory: subCategory || null,
    whatsappNotification: { sent: false, reason: 'WhatsApp notifications are not configured in this demo environment.' },
  };

  complaints.set(id, complaint);
  runAIOrchestrator(id);
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
  if (c.includes('infrastructure') || c.includes('road')) return 'Roads & Transport';
  if (c.includes('water')) return 'Water Supply';
  if (c.includes('sanitation')) return 'Sanitation';
  if (c.includes('electric') || c.includes('power')) return 'Electricity';
  if (c.includes('law') || c.includes('safety')) return 'Law & Order';
  return 'Public Services';
}

// Generic catch-all for any other /api/* GET/POST -> empty success envelope
app.use('/api', (req, res) => {
  res.json(ok({}));
});

const port = process.env.PORT || 5000;
app.listen(port, () => console.log('Mock API (with simple auth) listening on', port));
