import { prisma } from '../prisma/client.js';
import { predictModel1, predictModel2, sanitizeComplaintInput } from './prediction.service.js';
import { emitRealtime } from './realtime.service.js';

const MODEL_NAMES = {
  model1: 'MODEL_1_AUTHENTICITY_PRIORITY',
  model2: 'MODEL_2_CLASSIFICATION_SEVERITY',
};

const priorityScore = {
  LOW: 25,
  MEDIUM: 50,
  HIGH: 75,
  CRITICAL: 95,
};

const queue = [];
let isDraining = false;

function normalizePriority(value, fallback = 'MEDIUM') {
  const priority = String(value || fallback).toUpperCase();
  return ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].includes(priority) ? priority : fallback;
}

function estimateHours(priority, severityScore = 50) {
  const normalized = normalizePriority(priority);
  if (normalized === 'CRITICAL') return 4;
  if (normalized === 'HIGH') return severityScore >= 75 ? 8 : 12;
  if (normalized === 'MEDIUM') return 48;
  return 96;
}

function riskCategory(priority, validity, spamRisk) {
  if (String(spamRisk).toUpperCase() === 'HIGH' || String(validity).toLowerCase() === 'fake') return 'INTEGRITY_REVIEW';
  if (priority === 'CRITICAL') return 'PUBLIC_SAFETY';
  if (priority === 'HIGH') return 'SLA_RISK';
  return 'STANDARD';
}

function model1Processed(raw) {
  const priority = normalizePriority(raw.priority);
  const confidence = Number(raw.validity_confidence || raw.priority_confidence || 0);
  const estimatedResolutionHours = estimateHours(priority);
  const risk = riskCategory(priority, raw.validity, null);

  return {
    modelName: MODEL_NAMES.model1,
    modelVersion: '2.0.0',
    status: raw.unavailable && !raw.fallbackUsed ? 'FAILED' : 'COMPLETED',
    confidenceScore: confidence,
    priorityScore: priorityScore[priority],
    priorityLevel: priority,
    severityAnalysis: `Authenticity: ${raw.validity || 'Unavailable'}; priority: ${priority}.`,
    severityScore: priorityScore[priority],
    emergencyLevel: priority === 'CRITICAL' ? 'Immediate' : priority === 'HIGH' ? 'Elevated' : 'Routine',
    estimatedResolutionHours,
    riskCategory: risk,
    classification: raw.validity || 'Authenticity review',
    spamRisk: String(raw.validity).toLowerCase() === 'fake' ? 'HIGH' : 'LOW',
    aiRecommendation:
      raw.unavailable && !raw.fallbackUsed
        ? 'Model 1 unavailable. Continue officer triage and rerun AI analysis.'
        : raw.validity === 'Fake'
          ? 'Hold for authenticity review before dispatch.'
          : raw.fallbackUsed
            ? `Model 1 service unavailable. Heuristic fallback recommends ${priority.toLowerCase()} priority.`
          : `Treat as ${priority.toLowerCase()} priority and continue triage.`,
    escalationRecommendation: ['CRITICAL', 'HIGH'].includes(priority) ? 'Escalate if officer assignment is delayed.' : 'No escalation required.',
    processedOutput: {
      validity: raw.validity,
      validityConfidence: raw.validity_confidence,
      priority,
      priorityConfidence: raw.priority_confidence,
      trustScore: raw.trust_score,
      fallbackUsed: Boolean(raw.fallbackUsed),
      modelUnavailable: Boolean(raw.modelUnavailable),
    },
  };
}

function model2Processed(raw) {
  const priority = normalizePriority(raw.priority_level || raw.severity_level);
  const confidence = Number(raw.confidence || 0);
  const severityScore = Number(raw.severity_score || priorityScore[priority]);
  const estimatedResolutionHours = estimateHours(priority, severityScore);

  return {
    modelName: MODEL_NAMES.model2,
    modelVersion: '1.0.0',
    status: raw.unavailable ? 'COMPLETED' : 'COMPLETED',
    confidenceScore: confidence,
    priorityScore: priorityScore[priority],
    priorityLevel: priority,
    severityAnalysis: raw.ai_remarks || `${priority} severity classification.`,
    severityScore,
    emergencyLevel: raw.emergency_level || (priority === 'CRITICAL' ? 'Immediate' : 'Routine'),
    estimatedResolutionHours,
    suggestedDepartment: raw.suggested_department || raw.classification,
    riskCategory: riskCategory(priority, null, raw.fake_spam_risk),
    classification: raw.classification,
    areaImpact: raw.area_impact,
    spamRisk: raw.fake_spam_risk,
    aiRecommendation: raw.ai_remarks || `Route to ${raw.suggested_department || 'responsible department'}.`,
    escalationRecommendation: raw.escalation_recommendation,
    processedOutput: {
      classification: raw.classification,
      severityScore,
      suggestedDepartment: raw.suggested_department,
      priorityLevel: priority,
      areaImpact: raw.area_impact,
      spamRisk: raw.fake_spam_risk,
      confidence,
      probabilities: raw.probabilities || [],
      fallbackUsed: Boolean(raw.unavailable),
    },
  };
}

async function upsertOutput(complaintId, processed, raw, startedAt, error = null) {
  const completedAt = new Date();
  return prisma.aIModelOutput.upsert({
    where: {
      complaintId_modelName: {
        complaintId,
        modelName: processed.modelName,
      },
    },
    update: {
      ...processed,
      rawOutput: raw,
      errorLog: error ? { message: error.message || String(error) } : raw.error ? { message: raw.error } : null,
      processingStartedAt: startedAt,
      processingCompletedAt: completedAt,
    },
    create: {
      complaintId,
      ...processed,
      rawOutput: raw,
      errorLog: error ? { message: error.message || String(error) } : raw.error ? { message: raw.error } : null,
      processingStartedAt: startedAt,
      processingCompletedAt: completedAt,
    },
  });
}

async function recordResolutionPrediction(complaintId, output, complaintCreatedAt) {
  if (!output.estimatedResolutionHours) return null;
  const estimatedResolvedAt = new Date(new Date(complaintCreatedAt).getTime() + output.estimatedResolutionHours * 36e5);

  return prisma.resolutionPrediction.create({
    data: {
      complaintId,
      aiModelOutputId: output.id,
      modelName: output.modelName,
      estimatedResolutionHours: output.estimatedResolutionHours,
      estimatedResolvedAt,
      priorityLevel: normalizePriority(output.priorityLevel),
      riskCategory: output.riskCategory,
      performanceMetrics: {
        confidenceScore: Number(output.confidenceScore || 0),
        priorityScore: Number(output.priorityScore || 0),
      },
    },
  });
}

async function recordLog({ complaintId, modelName, status, startedAt, raw, error, attempt = 1 }) {
  const durationMs = startedAt ? Date.now() - startedAt.getTime() : null;
  return prisma.predictionLog.create({
    data: {
      complaintId,
      modelName,
      status,
      attempt,
      durationMs,
      inputMetadata: { source: 'complaint-registration' },
      outputMetadata: raw || null,
      errorMessage: error?.message || raw?.error || null,
    },
  });
}

async function updateComplaintFromAI(complaint, model2Output) {
  const update = {};
  const nextPriority = normalizePriority(model2Output.priorityLevel, complaint.priority);
  if (priorityScore[nextPriority] > priorityScore[complaint.priority]) update.priority = nextPriority;

  if (!complaint.departmentId && model2Output.suggestedDepartment) {
    const department = await prisma.department.findFirst({
      where: { name: { equals: model2Output.suggestedDepartment, mode: 'insensitive' } },
    });
    if (department) update.departmentId = department.id;
  }

  if (Object.keys(update).length) {
    await prisma.complaint.update({ where: { id: complaint.id }, data: update });
  }
}

async function notifyAIOutcome(complaint, output) {
  const recipientFilters = [
    { role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
    ...(complaint.assignedOfficerId ? [{ id: complaint.assignedOfficerId }] : []),
    ...(output.priorityLevel && ['HIGH', 'CRITICAL'].includes(output.priorityLevel) ? [{ role: 'OFFICER' }] : []),
  ];
  const recipients = await prisma.user.findMany({
    where: { OR: recipientFilters },
    select: { id: true },
    take: 25,
  });

  if (!recipients.length) return;

  await prisma.notification.createMany({
    data: recipients.map((recipient) => ({
      userId: recipient.id,
      title: `${output.priorityLevel || 'AI'} complaint prediction`,
      message: output.escalationRecommendation || output.aiRecommendation || `AI analysis completed for ${complaint.title}`,
    })),
    skipDuplicates: true,
  }).catch(() => null);
}

async function runForComplaint(complaintId) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: { attachments: true },
  });
  if (!complaint) return;

  emitRealtime('ai:processing', { complaintId, scope: 'operations', status: 'PROCESSING', location: extractLocation(complaint.description) });

  const text = sanitizeComplaintInput(`${complaint.title}. ${complaint.description}`);
  const started1 = new Date();
  const raw1 = await predictModel1(text);
  const output1 = await upsertOutput(complaint.id, model1Processed(raw1), raw1, started1);
  await recordLog({ complaintId: complaint.id, modelName: MODEL_NAMES.model1, status: output1.status, startedAt: started1, raw: raw1 });

  if (!raw1.unavailable) {
    await prisma.prediction.upsert({
      where: { id: output1.id },
      update: {},
      create: {
        id: output1.id,
        complaintId: complaint.id,
        category: 'Model 1',
        confidenceScore: raw1.validity_confidence,
        validity: raw1.validity,
        validityConfidence: raw1.validity_confidence,
        priority: raw1.priority,
        priorityConfidence: raw1.priority_confidence,
        trustScore: raw1.trust_score,
      },
    }).catch(() => null);
  }

  const started2 = new Date();
  const raw2 = await predictModel2({
    complaintText: text,
    attachments: complaint.attachments,
    location: extractLocation(complaint.description),
  });
  const output2 = await upsertOutput(complaint.id, model2Processed(raw2), raw2, started2);
  await recordLog({ complaintId: complaint.id, modelName: MODEL_NAMES.model2, status: output2.status, startedAt: started2, raw: raw2 });
  await recordResolutionPrediction(complaint.id, output1, complaint.createdAt);
  await recordResolutionPrediction(complaint.id, output2, complaint.createdAt);
  await updateComplaintFromAI(complaint, output2);
  await notifyAIOutcome(complaint, output2);

  await prisma.activityLog.create({
    data: {
      userId: complaint.citizenId,
      action: 'AI_MODELS_COMPLETED',
      entityType: 'Complaint',
      entityId: complaint.id,
      meta: {
        models: [MODEL_NAMES.model1, MODEL_NAMES.model2],
        model2Priority: output2.priorityLevel,
        model2Department: output2.suggestedDepartment,
      },
    },
  });

  emitRealtime('ai:completed', {
    complaintId,
    scope: 'operations',
    status: 'COMPLETED',
    location: extractLocation(complaint.description),
    outputs: [output1, output2],
  });
}

function extractLocation(description) {
  const match = String(description || '').match(/^Location:\s*(.+)$/im);
  return match?.[1]?.trim() || 'Location pending';
}

async function drainQueue() {
  if (isDraining) return;
  isDraining = true;
  while (queue.length) {
    const job = queue.shift();
    try {
      await runForComplaint(job.complaintId);
    } catch (error) {
      await recordLog({
        complaintId: job.complaintId,
        modelName: 'AI_ORCHESTRATOR',
        status: 'FAILED',
        startedAt: job.startedAt,
        error,
      }).catch(() => null);
      emitRealtime('ai:failed', { complaintId: job.complaintId, scope: 'operations', status: 'FAILED', error: error.message });
    }
  }
  isDraining = false;
}

export function enqueueAIProcessing(complaintId) {
  queue.push({ complaintId, startedAt: new Date() });
  emitRealtime('ai:queued', { complaintId, scope: 'operations', status: 'QUEUED' });
  setImmediate(drainQueue);
}

export async function rerunAIProcessing(complaintId) {
  await runForComplaint(complaintId);
  return getComplaintAIOutputs(complaintId);
}

export async function getComplaintAIOutputs(complaintId) {
  return prisma.aIModelOutput.findMany({
    where: { complaintId },
    orderBy: { createdAt: 'asc' },
    include: { resolutionPredictions: { orderBy: { createdAt: 'desc' }, take: 1 } },
  });
}

export async function buildCompletionReport(complaintId) {
  const complaint = await prisma.complaint.findUnique({
    where: { id: complaintId },
    include: {
      citizen: { select: { name: true, email: true } },
      department: true,
      assignedOfficer: { select: { id: true, name: true, email: true } },
      aiModelOutputs: { orderBy: { createdAt: 'asc' } },
      resolutionPredictions: { orderBy: { createdAt: 'desc' } },
      feedback: true,
      statusHistory: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  const actualHours = Math.max(0, (new Date(complaint.updatedAt).getTime() - new Date(complaint.createdAt).getTime()) / 36e5);
  const latestPrediction = complaint.resolutionPredictions[0];
  const estimatedHours = latestPrediction?.estimatedResolutionHours || null;
  const accuracyScore = estimatedHours
    ? Math.max(0, Math.round((1 - Math.abs(estimatedHours - actualHours) / Math.max(estimatedHours, actualHours, 1)) * 100))
    : null;
  const satisfaction = complaint.feedback.length
    ? complaint.feedback.reduce((sum, item) => sum + item.rating, 0) / complaint.feedback.length
    : null;

  return {
    complaintId: complaint.id,
    title: complaint.title,
    status: complaint.status,
    citizen: complaint.citizen,
    department: complaint.department?.name || 'Unassigned',
    assignedOfficer: complaint.assignedOfficer,
    createdAt: complaint.createdAt,
    completedAt: ['RESOLVED', 'CLOSED'].includes(complaint.status) ? complaint.updatedAt : null,
    aiModels: complaint.aiModelOutputs,
    recommendations: complaint.aiModelOutputs.map((output) => ({
      modelName: output.modelName,
      recommendation: output.aiRecommendation,
      confidenceScore: output.confidenceScore,
      riskCategory: output.riskCategory,
    })),
    estimatedVsActual: {
      estimatedHours,
      actualHours: Number(actualHours.toFixed(2)),
      accuracyScore,
    },
    performanceMetrics: {
      officerEfficiencyScore: accuracyScore,
      citizenSatisfactionScore: satisfaction ? Number((satisfaction * 20).toFixed(1)) : null,
      aiRecommendationComplianceScore: complaint.aiModelOutputs.some((output) => output.suggestedDepartment === complaint.department?.name) ? 100 : 75,
    },
    timeline: complaint.statusHistory,
  };
}
