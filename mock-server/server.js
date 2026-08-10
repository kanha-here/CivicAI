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
const SUPER_ADMIN_EMAIL = 'superadmin@griev.com';
const SUPER_ADMIN_PASSWORD = 'Griev@123';

function normalizeRole(role) {
  const value = String(role || 'citizen').trim().toLowerCase();
  if (['citizen', 'officer', 'admin', 'super_admin'].includes(value)) return value;
  return 'citizen';
}

function isApprovalRequiredRole(role) {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'officer';
}

function toPublicUser(u) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: true,
    image: null,
    status: u.status || 'ACTIVE',
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

// In-memory user store: email -> user record. This only ever holds ACTIVE
// accounts (citizen, officer, admin, super_admin) — an officer/admin
// signup never lands here until a super admin approves it (see
// pendingApprovals below). Keeping pending/rejected identities out of this
// map entirely — rather than in here with a status flag — is deliberate:
// it structurally rules out an entire class of bugs (a rejected request
// quietly still being able to log in, or a pending email permanently
// blocking that address from ever being used again).
const users = new Map();

users.set(SUPER_ADMIN_EMAIL, {
  id: randomUUID(),
  name: 'Super Admin',
  email: SUPER_ADMIN_EMAIL,
  role: 'super_admin',
  passwordHash: bcrypt.hashSync(SUPER_ADMIN_PASSWORD, 10),
  status: 'ACTIVE',
});

// In-memory store for officer/admin signups awaiting a decision, keyed by
// email. A pending request is NEVER copied into `users` until approved, so
// it can never accidentally authenticate. Rejecting a request deletes it
// from here outright — the email is immediately free to sign up again
// (as a citizen, or to re-request officer/admin) with no leftover trace.
const pendingApprovals = new Map();

// In-memory complaint store: id -> complaint record
const complaints = new Map();

function ok(data, message = "OK") {
  return { success: true, message, data };
}
function fail(res, status, message) {
  return res.status(status).json({ success: false, message, data: null });
}

// ---- Simple Auth (replaces Neon Auth) ----
const authRouter = express.Router();

authRouter.post('/sign-up/email', async (req, res) => {
  const { email, password, name, role } = req.body || {};
  if (!email || !password || !name) {
    return res.status(400).json({ message: 'name, email and password are required' });
  }
  const normalizedEmail = String(email).trim().toLowerCase();

  // Check both stores — an email can't be "taken" by an active account AND
  // separately taken by a request still awaiting a decision.
  if (users.has(normalizedEmail) || pendingApprovals.has(normalizedEmail)) {
    return res.status(409).json({ message: 'An account with this email already exists' });
  }

  const normalizedRole = normalizeRole(role);
  const passwordHash = await bcrypt.hash(password, 10);

  if (isApprovalRequiredRole(normalizedRole)) {
    // Queued for a super admin decision — nothing is written to `users`,
    // so this identity cannot log in, and this email is only "reserved"
    // while the request is pending. A reject frees it immediately.
    pendingApprovals.set(normalizedEmail, {
      id: randomUUID(),
      name,
      email: normalizedEmail,
      passwordHash,
      requestedRole: normalizedRole,
      requestedAt: new Date().toISOString(),
    });
    return res.status(202).json({
      message: 'Credentials Sent To Admin For Approval',
      user: null,
      session: null,
      pendingApproval: true,
    });
  }

  const user = {
    id: randomUUID(),
    name,
    email: normalizedEmail,
    role: normalizedRole,
    passwordHash,
    status: 'ACTIVE',
  };
  users.set(user.email, user);

  const token = signToken(user);
  res.setHeader('set-auth-jwt', token);
  res.json({ user: toPublicUser(user), session: { token }, pendingApproval: false });
});

authRouter.post('/sign-in/email', async (req, res) => {
  const { email, password } = req.body || {};
  const normalizedEmail = String(email || '').trim().toLowerCase();

  // Check the pending queue first — but only reveal "pending" once the
  // password actually matches, so this endpoint can't be used to fish for
  // which email addresses have a pending officer/admin request.
  const pending = pendingApprovals.get(normalizedEmail);
  if (pending) {
    const pendingMatch = await bcrypt.compare(password || '', pending.passwordHash);
    if (pendingMatch) {
      return res.status(403).json({
        message: `Your ${pending.requestedRole} account is still awaiting admin approval.`,
        pendingApproval: true,
      });
    }
    // Wrong password against a pending record — fall through to the
    // generic invalid-credentials response below, same as any other
    // non-existent or mistyped login, so nothing is leaked either way.
  }

  const user = users.get(normalizedEmail);
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

app.get('/api/admin/pending-approvals', (req, res) => {
  const requester = currentUser(req);
  if (!requester || requester.role !== 'super_admin') {
    return fail(res, 403, 'Only the super admin can view pending approvals.');
  }

  const pending = Array.from(pendingApprovals.values())
    .map((request) => ({
      id: request.id,
      name: request.name,
      email: request.email,
      requestedRole: request.requestedRole,
      requestedAt: request.requestedAt,
    }))
    .sort((a, b) => (a.requestedAt < b.requestedAt ? 1 : -1));

  return res.json(ok({ items: pending }, 'Pending approvals fetched'));
});

app.post('/api/admin/pending-approvals/:email/:decision', (req, res) => {
  const requester = currentUser(req);
  if (!requester || requester.role !== 'super_admin') {
    return fail(res, 403, 'Only the super admin can approve or reject access requests.');
  }

  const email = String(req.params.email || '').trim().toLowerCase();
  const decision = String(req.params.decision || '').toLowerCase();
  const pending = pendingApprovals.get(email);

  if (!pending) {
    return fail(res, 404, 'No pending admin or officer request exists for that email.');
  }

  if (decision === 'approve') {
    users.set(email, {
      id: pending.id,
      name: pending.name,
      email,
      role: pending.requestedRole,
      passwordHash: pending.passwordHash,
      status: 'ACTIVE',
    });
    pendingApprovals.delete(email);
    return res.json(ok({ email, role: pending.requestedRole }, 'Request approved successfully.'));
  }

  if (decision === 'reject') {
    // Deleted outright, not just flagged — this is what actually frees the
    // email up again and guarantees a rejected request can never later
    // authenticate.
    pendingApprovals.delete(email);
    return res.json(ok({ email }, 'Request rejected successfully.'));
  }

  return fail(res, 400, 'Decision must be approve or reject.');
});

app.get('/api/admin/users', (req, res) => {
  const requester = currentUser(req);
  if (!requester || !['admin', 'super_admin'].includes(requester.role)) {
    return fail(res, 403, 'Only admins can access user management.');
  }

  const list = Array.from(users.values()).map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status === 'ACTIVE' ? 'Active' : user.status === 'PENDING_APPROVAL' ? 'Pending' : 'Inactive',
    department: 'Unassigned',
    createdAt: new Date().toISOString(),
  }));

  return res.json(ok({
    users: list,
    stats: {
      totalUsers: list.length,
      admins: list.filter((user) => user.role === 'admin' || user.role === 'super_admin').length,
      systemHealth: 100,
      securityAlerts: 0,
    },
  }, 'Users retrieved'));
});

app.get('/api/admin/officers/performance', (req, res) => {
  const requester = currentUser(req);
  if (!requester || !['admin', 'super_admin'].includes(requester.role)) {
    return fail(res, 403, 'Only admins can access officer performance.');
  }

  const officers = Array.from(users.values())
    .filter((user) => user.role === 'officer' && user.status === 'ACTIVE')
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      department: 'Unassigned',
      casesTaken: 0,
      casesSolved: 0,
      activeCases: 0,
      feedbackCount: 0,
      averageRating: 0,
      resolutionRate: 0,
      recentFeedback: [],
    }));

  return res.json(ok({
    officers,
    stats: {
      totalOfficers: officers.length,
      totalCasesTaken: 0,
      totalCasesSolved: 0,
      totalFeedback: 0,
      averageRating: 0,
    },
  }, 'Officer performance retrieved'));
});

// ---------------------------------------------------------------------------
// AI model clients
// ---------------------------------------------------------------------------
// The mock server is the application's backend in the demo, but inference is
// still performed by the real FastAPI model services. This keeps the mock
// server lightweight while ensuring the UI sees genuine model predictions.
//
// Model 1: ONNX FastAPI service. Set MODEL1_URL to the deployed API URL.
// Model 2: Hugging Face FastAPI Space (Department Classifier).
// ---------------------------------------------------------------------------

const MODEL1_URL = String(process.env.MODEL1_URL || process.env.FASTAPI_URL || 'http://localhost:8000').replace(/\/$/, '');
const MODEL2_URL = String(
  process.env.MODEL2_URL || 'https://kanhacoderx-department-classifier.hf.space',
).replace(/\/$/, '');
const MODEL_TIMEOUT_MS = Number(process.env.MODEL_TIMEOUT_MS || 90000);
const MODEL_RETRIES = Number(process.env.MODEL_RETRIES || 1);

const PRIORITY_SCORE = { LOW: 25, MEDIUM: 50, HIGH: 75, CRITICAL: 95 };

async function postModel(url, body, { retries = MODEL_RETRIES, timeout = MODEL_TIMEOUT_MS } = {}) {
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: controller.signal,
      });
      const raw = await response.text();
      let data = null;
      try { data = raw ? JSON.parse(raw) : null; } catch { data = { detail: raw }; }
      if (!response.ok) {
        const error = new Error(data?.detail || data?.message || `Model returned HTTP ${response.status}`);
        error.status = response.status;
        throw error;
      }
      return data;
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError;
}

function modelError(error, modelName) {
  return {
    message: error?.message || `${modelName} unavailable`,
    status: error?.status || null,
  };
}

async function predictModel1(complaintText) {
  const complaint = String(complaintText || '').trim();
  const data = await postModel(`${MODEL1_URL}/predict`, { complaint });
  return {
    ...data,
    modelName: 'MODEL_1_AUTHENTICITY_PRIORITY',
    modelVersion: data.model_version || '2.0.0',
    modelUsed: true,
    fallbackUsed: false,
  };
}

async function predictModel2(complaintText, location = 'unknown') {
  const complaint = String(complaintText || '').trim();
  const data = await postModel(`${MODEL2_URL}/predict-department`, {
    complaint_text: complaint,
    location: location || 'unknown',
  });
  return {
    ...data,
    modelName: 'MODEL_2_CLASSIFICATION_SEVERITY',
    modelVersion: data.model || '1.0.0',
    modelUsed: true,
    fallbackUsed: false,
  };
}

function textHeuristics(complaintText) {
  const text = String(complaintText || '').toLowerCase();
  const criticalTerms = ['fire', 'death', 'injury', 'hospital', 'electrocution', 'collapse', 'flood', 'sewage overflow', 'gas leak', 'accident'];
  const highTerms = ['urgent', 'danger', 'dangerous', 'blocked', 'contaminated', 'overflow', 'broken', 'no water', 'power outage', 'sparking'];
  const spamTerms = ['buy now', 'lottery', 'crypto', 'http://', 'https://', 'free money'];
  const criticalHits = criticalTerms.filter((term) => text.includes(term)).length;
  const highHits = highTerms.filter((term) => text.includes(term)).length;
  const spamHits = spamTerms.filter((term) => text.includes(term)).length;
  const severityScore = Math.min(100, 35 + criticalHits * 25 + highHits * 12 + Math.min(text.length / 80, 20));
  const priorityLevel = severityScore >= 85 ? 'CRITICAL' : severityScore >= 65 ? 'HIGH' : severityScore >= 40 ? 'MEDIUM' : 'LOW';
  return {
    priorityLevel,
    severityScore: Number(severityScore.toFixed(2)),
    spamRisk: spamHits ? 'HIGH' : text.length < 12 ? 'MEDIUM' : 'LOW',
  };
}

function model1Fallback(complaintText, error) {
  const heuristic = textHeuristics(complaintText);
  const validity = heuristic.spamRisk === 'HIGH' ? 'Fake' : 'Authentic';
  const validityConfidence = heuristic.spamRisk === 'HIGH' ? 82 : 76;
  const priorityConfidence = heuristic.priorityLevel === 'CRITICAL' ? 92 : heuristic.priorityLevel === 'HIGH' ? 86 : 78;
  const trustScore = validity === 'Fake' ? 0.28 : Number((priorityConfidence / 100).toFixed(3));
  return {
    complaint: complaintText,
    validity,
    validity_confidence: validityConfidence,
    priority: heuristic.priorityLevel,
    priority_confidence: priorityConfidence,
    trust_score: trustScore,
    modelName: 'MODEL_1_AUTHENTICITY_PRIORITY',
    modelVersion: 'fallback-heuristic',
    modelUsed: false,
    fallbackUsed: true,
    modelUnavailable: true,
    error: modelError(error, 'Model 1'),
  };
}

function model2Fallback(complaintText, error) {
  const heuristic = textHeuristics(complaintText);
  return {
    complaint_text: complaintText,
    predicted_department: 'Public Services',
    confidence: 0,
    probabilities: [],
    modelName: 'MODEL_2_CLASSIFICATION_SEVERITY',
    modelVersion: 'fallback',
    modelUsed: false,
    fallbackUsed: true,
    unavailable: true,
    error: modelError(error, 'Model 2'),
    fallbackPriorityLevel: heuristic.priorityLevel,
  };
}

function estimateResolutionHours(priority, severityScore = 50) {
  if (priority === 'CRITICAL') return 4;
  if (priority === 'HIGH') return severityScore >= 75 ? 8 : 12;
  if (priority === 'MEDIUM') return 48;
  return 96;
}

async function runAIOrchestrator(complaintId) {
  const complaint = complaints.get(complaintId);
  if (!complaint) return;

  const text = `${complaint.title}. ${complaint.description}`;
  const location = complaint.location || 'unknown';
  complaint.aiStatus = 'PROCESSING';
  complaint.updatedAt = new Date().toISOString();

  const startedAt = new Date().toISOString();
  const [model1Result, model2Result] = await Promise.allSettled([
    predictModel1(text),
    predictModel2(text, location),
  ]);

  const model1 = model1Result.status === 'fulfilled'
    ? model1Result.value
    : model1Fallback(text, model1Result.reason);
  const model2 = model2Result.status === 'fulfilled'
    ? model2Result.value
    : model2Fallback(text, model2Result.reason);

  const priority = String(model1.priority || 'MEDIUM').toUpperCase();
  const priorityScore = PRIORITY_SCORE[priority] || PRIORITY_SCORE.MEDIUM;
  const priorityConfidence = Number(model1.priority_confidence || 0);
  const department = model2.predicted_department || null;
  const departmentConfidence = Number(model2.confidence || 0) * 100;
  const resolutionHours = estimateResolutionHours(priority, priorityScore);

  complaint.aiModelOutputs = [
    {
      id: randomUUID(),
      modelName: 'MODEL_1_AUTHENTICITY_PRIORITY',
      modelVersion: model1.modelVersion,
      status: model1.fallbackUsed ? 'FALLBACK' : 'COMPLETED',
      confidenceScore: Number(model1.validity_confidence || 0),
      priorityScore,
      priorityLevel: priority,
      severityAnalysis: `Authenticity: ${model1.validity || 'Unknown'}; priority: ${priority}.`,
      severityScore: priorityScore,
      emergencyLevel: priority === 'CRITICAL' ? 'Immediate' : priority === 'HIGH' ? 'Elevated' : 'Routine',
      estimatedResolutionHours: resolutionHours,
      riskCategory: model1.validity === 'Fake' ? 'INTEGRITY_REVIEW' : priority === 'CRITICAL' ? 'PUBLIC_SAFETY' : priority === 'HIGH' ? 'SLA_RISK' : 'STANDARD',
      classification: model1.validity,
      priorityLevel: priority,
      spamRisk: model1.validity === 'Fake' ? 'HIGH' : 'LOW',
      aiRecommendation: model1.validity === 'Fake'
        ? 'Hold for authenticity review before dispatch.'
        : `Treat as ${priority.toLowerCase()} priority and continue triage.`,
      escalationRecommendation: ['CRITICAL', 'HIGH'].includes(priority) ? 'Escalate if officer assignment is delayed.' : 'No escalation required.',
      processedOutput: model1,
      errorLog: model1.error || null,
    },
    {
      id: randomUUID(),
      modelName: 'MODEL_2_CLASSIFICATION_SEVERITY',
      modelVersion: model2.modelVersion,
      status: model2.fallbackUsed ? 'FALLBACK' : 'COMPLETED',
      confidenceScore: departmentConfidence,
      priorityScore,
      priorityLevel: priority,
      severityAnalysis: department ? `Real Model 2 prediction: ${department}.` : 'Department prediction unavailable.',
      severityScore: priorityScore,
      emergencyLevel: priority === 'CRITICAL' ? 'Immediate' : priority === 'HIGH' ? 'Elevated' : 'Routine',
      estimatedResolutionHours: resolutionHours,
      suggestedDepartment: department,
      classification: department,
      riskCategory: model1.validity === 'Fake' ? 'INTEGRITY_REVIEW' : priority === 'CRITICAL' ? 'PUBLIC_SAFETY' : priority === 'HIGH' ? 'SLA_RISK' : 'STANDARD',
      aiRecommendation: department ? `Route complaint to ${department}.` : 'Manual department review required.',
      escalationRecommendation: ['CRITICAL', 'HIGH'].includes(priority) ? 'Escalate if officer assignment is delayed.' : 'No escalation required.',
      areaImpact: priority === 'CRITICAL' ? 'Potential safety-sensitive impact' : 'Localized impact likely',
      spamRisk: model1.validity === 'Fake' ? 'HIGH' : 'LOW',
      processedOutput: model2,
      errorLog: model2.error || null,
    },
  ];

  complaint.prediction = {
    complaint: text,
    validity: model1.validity,
    validity_confidence: model1.validity_confidence,
    priority,
    priority_confidence: model1.priority_confidence,
    trust_score: model1.trust_score,
    classification: department || 'Pending',
    classification_confidence: departmentConfidence,
    suggestedDepartment: department || null,
    modelUsed: Boolean(model1.modelUsed),
    fallbackUsed: Boolean(model1.fallbackUsed),
    modelUnavailable: Boolean(model1.modelUnavailable),
    status: model1.fallbackUsed ? 'FALLBACK' : 'COMPLETED',
    error: model1.error || null,
  };

  complaint.predictions = [{
    validity: model1.validity,
    validityConfidence: model1.validity_confidence,
    priority,
    priorityConfidence: model1.priority_confidence,
    trustScore: model1.trust_score,
    classification: department || 'Pending',
    classificationConfidence: departmentConfidence,
    suggestedDepartment: department || null,
  }];

  complaint.priority = priority.toLowerCase();
  complaint.department = department ? { id: 'dept-auto', name: department } : null;
  complaint.aiStatus = model1.fallbackUsed || model2.fallbackUsed ? 'COMPLETED_WITH_FALLBACK' : 'COMPLETED';
  complaint.aiStartedAt = startedAt;
  complaint.aiCompletedAt = new Date().toISOString();
  complaint.updatedAt = new Date().toISOString();
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

  const complaint = {
    id,
    title: title || `${category || 'Complaint'} report`,
    description,
    status: 'submitted',
    priority: priority || 'medium',
    createdAt: now,
    updatedAt: now,
    department: { id: 'dept-pending', name: routeDepartment(category) },
    location: String(req.body?.location || 'unknown'),
    aiStatus: 'QUEUED',
    prediction: {
      complaint: predictionText,
      status: 'QUEUED',
      modelUsed: false,
      fallbackUsed: false,
      message: 'Real AI models are processing this complaint.',
    },
    predictions: [],
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
    imageVerification: req.body?.imageVerification || null,
    whatsappNotification: { sent: false, reason: 'WhatsApp notifications are not configured in this demo environment.' },
  };

  complaints.set(id, complaint);
  runAIOrchestrator(id).catch((error) => {
    const saved = complaints.get(id);
    if (!saved) return;
    saved.aiStatus = 'FAILED';
    saved.updatedAt = new Date().toISOString();
    saved.prediction = {
      complaint: predictionText,
      status: 'FAILED',
      modelUsed: false,
      fallbackUsed: false,
      error: error?.message || 'AI pipeline failed',
    };
  });
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

app.get('/api/ai/health', async (req, res) => {
  const check = async (url) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    try {
      const response = await fetch(url, { signal: controller.signal });
      return { ok: response.ok, status: response.status };
    } catch (error) {
      return { ok: false, status: null, error: error.message };
    } finally {
      clearTimeout(timer);
    }
  };

  const [model1, model2] = await Promise.all([
    check(`${MODEL1_URL}/`),
    check(`${MODEL2_URL}/`),
  ]);

  res.json(ok({
    model1: { url: MODEL1_URL, ...model1 },
    model2: { url: MODEL2_URL, ...model2 },
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
