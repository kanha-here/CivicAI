import axios from 'axios';

const FASTAPI_URL = process.env.FASTAPI_URL || 'http://localhost:8000';
const MODEL1_URL = process.env.MODEL1_URL || FASTAPI_URL;
const MODEL2_URL = process.env.MODEL2_URL || process.env.MODEL2_FASTAPI_URL || 'http://localhost:8001';
const FASTAPI_TIMEOUT_MS = Number(process.env.FASTAPI_TIMEOUT_MS || 8000);
const MAX_COMPLAINT_CHARS = Number(process.env.AI_MAX_COMPLAINT_CHARS || 6000);

export function sanitizeComplaintInput(value) {
  return String(value || '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_COMPLAINT_CHARS);
}

function normalizeBaseUrl(url) {
  return String(url || '').replace(/\/$/, '');
}

async function postWithRetry(url, body, { timeout = FASTAPI_TIMEOUT_MS, retries = 1 } = {}) {
  let lastError;
  for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
    try {
      const response = await axios.post(url, body, { timeout });
      return { data: response.data, attempt };
    } catch (error) {
      lastError = error;
      if (attempt <= retries) {
        await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
      }
    }
  }

  throw lastError;
}

export async function predictComplaint(complaintText) {
  return predictModel1(complaintText);
}

export async function predictModel1(complaintText) {
  const complaint = sanitizeComplaintInput(complaintText);
  try {
    const response = await postWithRetry(`${normalizeBaseUrl(MODEL1_URL)}/predict`, { complaint }, { retries: 1 });

    return response.data;
  } catch (error) {
    const fallback = predictModel1Heuristic(complaint);
    return {
      complaint,
      ...fallback,
      fallbackUsed: true,
      modelUnavailable: true,
      error: error.response?.data?.detail || error.message || 'Prediction service unavailable',
    };
  }
}

export function predictModel1Heuristic(complaintText) {
  const heuristic = textHeuristics(complaintText);
  const spamRisk = String(heuristic.fake_spam_risk || '').toUpperCase();
  const validity = spamRisk === 'HIGH' ? 'Fake' : 'Authentic';
  const validityConfidence = spamRisk === 'HIGH' ? 82 : Math.min(94, Math.max(68, heuristic.confidence + 4));
  const priorityConfidence = Math.min(94, Math.max(65, heuristic.confidence));
  const trustScore = validity === 'Fake'
    ? 0.28
    : Number(Math.min(0.97, Math.max(0.62, priorityConfidence / 100)).toFixed(3));

  return {
    validity,
    validity_confidence: Number(validityConfidence.toFixed(2)),
    priority: heuristic.priority_level,
    priority_confidence: Number(priorityConfidence.toFixed(2)),
    trust_score: trustScore,
  };
}

function textHeuristics(complaintText) {
  const text = sanitizeComplaintInput(complaintText).toLowerCase();
  const criticalTerms = ['fire', 'death', 'injury', 'hospital', 'electrocution', 'collapse', 'flood', 'sewage overflow', 'gas leak'];
  const highTerms = ['urgent', 'danger', 'accident', 'blocked', 'contaminated', 'overflow', 'broken', 'no water', 'power outage'];
  const spamTerms = ['buy now', 'lottery', 'crypto', 'http://', 'https://', 'free money'];

  const criticalHits = criticalTerms.filter((term) => text.includes(term)).length;
  const highHits = highTerms.filter((term) => text.includes(term)).length;
  const spamHits = spamTerms.filter((term) => text.includes(term)).length;
  const severityScore = Math.min(100, 35 + criticalHits * 25 + highHits * 12 + Math.min(text.length / 80, 20));
  const priorityLevel = severityScore >= 85 ? 'CRITICAL' : severityScore >= 65 ? 'HIGH' : severityScore >= 40 ? 'MEDIUM' : 'LOW';

  let suggestedDepartment = 'Public Works';
  if (text.includes('garbage') || text.includes('waste') || text.includes('sewage') || text.includes('sanitation')) suggestedDepartment = 'Sanitation';
  else if (text.includes('water') || text.includes('pipe') || text.includes('drain')) suggestedDepartment = 'Water Supply';
  else if (text.includes('light') || text.includes('electric') || text.includes('power')) suggestedDepartment = 'Electrical';
  else if (text.includes('traffic') || text.includes('signal') || text.includes('road') || text.includes('pothole')) suggestedDepartment = 'Public Works';

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
  };
}

export async function predictModel2({ complaintText, attachments = [], location = 'unknown' }) {
  const complaint = sanitizeComplaintInput(complaintText);
  try {
    const response = await postWithRetry(
      `${normalizeBaseUrl(MODEL2_URL)}/predict-department`,
      {
        complaint_text: complaint,
        location,
        media: attachments.map((item) => ({
          fileUrl: item.fileUrl,
          fileName: item.fileName,
        })),
      },
      { retries: 1 },
    );

    const heuristic = textHeuristics(complaint);
    return {
      ...heuristic,
      classification: response.data.predicted_department || heuristic.classification,
      suggested_department: response.data.predicted_department || heuristic.suggested_department,
      confidence: Number(((response.data.confidence || 0) * 100).toFixed(2)) || heuristic.confidence,
      probabilities: response.data.probabilities || [],
      model: response.data.model,
      method: response.data.method,
    };
  } catch (error) {
    return {
      ...textHeuristics(complaint),
      unavailable: true,
      error: error.response?.data?.detail || error.message || 'Model 2 service unavailable; heuristic fallback used',
    };
  }
}
