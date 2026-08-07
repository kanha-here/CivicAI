import { prisma } from '../../prisma/client.js';
import { enqueueAIProcessing } from '../../services/ai-orchestrator.service.js';
import { predictModel1Heuristic, sanitizeComplaintInput } from '../../services/prediction.service.js';
import { emitRealtime } from '../../services/realtime.service.js';
import { sendComplaintConfirmation } from '../../services/whatsapp.service.js';

function buildComplaintWhere({ search, status, priority, departmentId, citizenId }) {
  const where = {};

  if (status) where.status = String(status).toUpperCase();
  if (priority) where.priority = String(priority).toUpperCase();
  if (departmentId) where.departmentId = departmentId;
  if (citizenId) where.citizenId = citizenId;

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  return where;
}

export async function createComplaint(data, actorId, options = {}) {
  const complaintPriority = String(data.priority || 'MEDIUM').toUpperCase();

  const complaint = await prisma.complaint.create({
    data: {
      title: data.title,
      description: data.description,
      priority: complaintPriority,
      departmentId: data.departmentId || null,
      citizenId: actorId,
      assignedOfficerId: data.assignedOfficerId || null,
      attachments: Array.isArray(data.attachments) && data.attachments.length
        ? {
            create: data.attachments
              .filter((attachment) => attachment?.fileUrl)
              .map((attachment) => ({
                fileUrl: attachment.fileUrl,
                fileName: attachment.fileName || null,
              })),
          }
        : undefined,
    },
  });

  await prisma.complaintStatusHistory.create({
    data: {
      complaintId: complaint.id,
      oldStatus: null,
      newStatus: complaint.status,
      changedById: actorId,
      note: 'Complaint submitted',
    },
  });

  await prisma.activityLog.create({
    data: {
      userId: actorId,
      action: 'COMPLAINT_CREATED',
      entityType: 'Complaint',
      entityId: complaint.id,
      meta: { title: complaint.title, source: data.source || 'portal' },
    },
  });

  const predictionText = sanitizeComplaintInput(`${complaint.title}. ${complaint.description}`);
  const immediatePrediction = predictModel1Heuristic(predictionText);

  const savedPrediction = await prisma.prediction.create({
    data: {
      complaintId: complaint.id,
      category: 'Immediate citizen triage',
      confidenceScore: immediatePrediction.priority_confidence,
      validity: immediatePrediction.validity,
      validityConfidence: immediatePrediction.validity_confidence,
      priority: immediatePrediction.priority,
      priorityConfidence: immediatePrediction.priority_confidence,
      trustScore: immediatePrediction.trust_score,
    },
  }).catch(() => null);

  const result = {
    ...complaint,
    prediction: {
      complaint: predictionText,
      ...immediatePrediction,
      unavailable: false,
      fallbackUsed: true,
      message: 'Immediate AI triage generated',
    },
    predictions: savedPrediction ? [savedPrediction] : [{
      validity: immediatePrediction.validity,
      validityConfidence: immediatePrediction.validity_confidence,
      priority: immediatePrediction.priority,
      priorityConfidence: immediatePrediction.priority_confidence,
      trustScore: immediatePrediction.trust_score,
    }],
    aiModelOutputs: [],
  };

  enqueueAIProcessing(complaint.id);

  let whatsappNotification = { sent: false, reason: 'WhatsApp notification disabled for this source' };

  if (options.notifyWhatsApp !== false) {
    const user = await prisma.user.findUnique({ where: { id: actorId } });
    if (user?.phone) {
      const notification = await sendComplaintConfirmation({
        user,
        complaint: result,
        prediction: result.prediction,
      }).catch((error) => ({ sent: false, reason: error.message }));
      whatsappNotification = notification;

      await prisma.activityLog.create({
        data: {
          userId: actorId,
          action: notification.sent ? 'WHATSAPP_CONFIRMATION_SENT' : 'WHATSAPP_CONFIRMATION_SKIPPED',
          entityType: 'Complaint',
          entityId: result.id,
          meta: notification,
        },
      });
    } else {
      whatsappNotification = { sent: false, reason: 'Profile phone number is not set' };
      await prisma.activityLog.create({
        data: {
          userId: actorId,
          action: 'WHATSAPP_CONFIRMATION_SKIPPED',
          entityType: 'Complaint',
          entityId: result.id,
          meta: whatsappNotification,
        },
      });
    }
  }

  return { ...result, whatsappNotification };
}

export async function listComplaints(query, currentUser) {
  const page = Math.max(parseInt(query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;

  const isCitizen = currentUser?.role === 'citizen';
  const where = buildComplaintWhere({
    search: query.search,
    status: query.status,
    priority: query.priority,
    departmentId: query.departmentId,
    citizenId: isCitizen ? currentUser.id : query.citizenId,
  });

  const [total, complaints] = await prisma.$transaction([
    prisma.complaint.count({ where }),
    prisma.complaint.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        citizen: { select: { id: true, name: true, email: true, role: true } },
        department: true,
        assignedOfficer: { select: { id: true, name: true, email: true, role: true } },
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 8, include: { changedBy: { select: { name: true } } } },
        attachments: { orderBy: { createdAt: 'desc' }, take: 6 },
        feedback: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, role: true } } } },
        predictions: { orderBy: { createdAt: 'desc' }, take: 1 },
        aiModelOutputs: { orderBy: { createdAt: 'asc' } },
        resolutionPredictions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
  ]);

  return {
    items: complaints,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(Math.ceil(total / limit), 1),
    },
  };
}

export async function getComplaintById(id, currentUser) {
  const complaint = await prisma.complaint.findUnique({
    where: { id },
    include: {
      citizen: { select: { id: true, name: true, email: true, role: true } },
      department: true,
      assignedOfficer: { select: { id: true, name: true, email: true, role: true } },
      statusHistory: { orderBy: { createdAt: 'desc' }, include: { changedBy: { select: { name: true } } } },
      attachments: true,
      feedback: { orderBy: { createdAt: 'desc' }, include: { user: { select: { id: true, name: true, role: true } } } },
      predictions: true,
      aiModelOutputs: { orderBy: { createdAt: 'asc' } },
      resolutionPredictions: { orderBy: { createdAt: 'desc' } },
      incidents: true,
    },
  });

  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser?.role === 'citizen' && complaint.citizenId !== currentUser.id) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  return complaint;
}

export async function updateComplaint(id, data, currentUser) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser?.role === 'citizen' && existing.citizenId !== currentUser.id) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  const nextStatus = data.status ? String(data.status).toUpperCase() : existing.status;
  const nextPriority = data.priority ? String(data.priority).toUpperCase() : existing.priority;
  const statusChanged = nextStatus !== existing.status;

  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      title: data.title ?? existing.title,
      description: data.description ?? existing.description,
      status: nextStatus,
      priority: nextPriority,
      departmentId: data.departmentId ?? existing.departmentId,
      assignedOfficerId: data.assignedOfficerId ?? existing.assignedOfficerId,
    },
  });

  if (statusChanged) {
    await prisma.complaintStatusHistory.create({
      data: {
        complaintId: id,
        oldStatus: existing.status,
        newStatus: nextStatus,
        changedById: currentUser.id,
        note: data.note || 'Status updated',
      },
    });
  }

  if (['RESOLVED', 'CLOSED'].includes(nextStatus)) {
    const actualResolutionHours = Math.max(0, (new Date(updated.updatedAt).getTime() - new Date(existing.createdAt).getTime()) / 36e5);
    const predictions = await prisma.resolutionPrediction.findMany({ where: { complaintId: id } });
    await Promise.all(predictions.map((prediction) => {
      const estimated = prediction.estimatedResolutionHours || 0;
      const accuracyScore = estimated
        ? Math.max(0, Math.round((1 - Math.abs(estimated - actualResolutionHours) / Math.max(estimated, actualResolutionHours, 1)) * 100))
        : null;
      return prisma.resolutionPrediction.update({
        where: { id: prediction.id },
        data: {
          actualResolutionHours,
          accuracyScore,
          officerEfficiencyScore: accuracyScore,
          performanceMetrics: {
            ...(prediction.performanceMetrics || {}),
            resolvedAt: updated.updatedAt,
            status: nextStatus,
          },
        },
      });
    }));
  }

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: 'COMPLAINT_UPDATED',
      entityType: 'Complaint',
      entityId: id,
      meta: data,
    },
  });

  emitRealtime('complaint:updated', { complaintId: id, scope: 'operations', status: updated.status });

  return updated;
}

function assertComplaintAccessForWrite(complaint, currentUser) {
  if (currentUser?.role === 'citizen' && complaint.citizenId !== currentUser.id) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }
}

export async function addComplaintProgress(id, data, currentUser) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser?.role === 'officer' && existing.assignedOfficerId && existing.assignedOfficerId !== currentUser.id) {
    const error = new Error('Only the assigned officer can update this work progress');
    error.statusCode = 403;
    throw error;
  }
  if (currentUser?.role === 'citizen') {
    const error = new Error('Citizens can add feedback after officer updates, not work progress');
    error.statusCode = 403;
    throw error;
  }

  const nextStatus = data.status ? String(data.status).toUpperCase() : existing.status;
  const updated = await prisma.complaint.update({
    where: { id },
    data: {
      status: nextStatus,
      assignedOfficerId: existing.assignedOfficerId || currentUser.id,
    },
  });

  const note = await prisma.complaintStatusHistory.create({
    data: {
      complaintId: id,
      oldStatus: existing.status,
      newStatus: nextStatus,
      changedById: currentUser.id,
      note: data.comment || 'Officer shared a work progress update.',
    },
  });

  let attachment = null;
  if (data.imageUrl) {
    attachment = await prisma.attachment.create({
      data: {
        complaintId: id,
        fileUrl: data.imageUrl,
        fileName: data.fileName || `officer-progress-${Date.now()}.jpg`,
      },
    });
  }

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: 'COMPLAINT_PROGRESS_UPDATED',
      entityType: 'Complaint',
      entityId: id,
      meta: { comment: data.comment || null, imageAttached: Boolean(attachment), status: nextStatus },
    },
  });

  emitRealtime('complaint:updated', {
    complaintId: id,
    scope: 'operations',
    status: nextStatus,
    comment: note.note,
    imageUrl: attachment?.fileUrl || null,
  });

  return getComplaintById(id, currentUser);
}

export async function addComplaintFeedback(id, data, currentUser) {
  const complaint = await prisma.complaint.findUnique({ where: { id } });
  if (!complaint) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }
  assertComplaintAccessForWrite(complaint, currentUser);

  const feedback = await prisma.feedback.create({
    data: {
      complaintId: id,
      userId: currentUser.id,
      rating: Number(data.rating),
      review: data.review || null,
    },
    include: { user: { select: { id: true, name: true, role: true } } },
  });

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: 'CITIZEN_FEEDBACK_CREATED',
      entityType: 'Complaint',
      entityId: id,
      meta: { rating: feedback.rating, review: feedback.review },
    },
  });

  emitRealtime('complaint:feedback', { complaintId: id, scope: 'operations', rating: feedback.rating });
  return feedback;
}

export async function buildComplaintWorkReport(id, currentUser) {
  const complaint = await getComplaintById(id, currentUser);
  return {
    reportId: `WR-${complaint.id}`,
    generatedAt: new Date(),
    trackingId: complaint.id,
    title: complaint.title,
    status: complaint.status,
    priority: complaint.priority,
    citizen: complaint.citizen,
    assignedOfficer: complaint.assignedOfficer,
    department: complaint.department,
    description: complaint.description,
    progress: complaint.statusHistory,
    images: complaint.attachments,
    feedback: complaint.feedback,
    aiOutputs: complaint.aiModelOutputs,
    resolutionPredictions: complaint.resolutionPredictions,
  };
}

export async function deleteComplaint(id, currentUser) {
  const existing = await prisma.complaint.findUnique({ where: { id } });
  if (!existing) {
    const error = new Error('Complaint not found');
    error.statusCode = 404;
    throw error;
  }

  if (currentUser?.role === 'citizen' && existing.citizenId !== currentUser.id) {
    const error = new Error('Forbidden');
    error.statusCode = 403;
    throw error;
  }

  await prisma.activityLog.create({
    data: {
      userId: currentUser.id,
      action: 'COMPLAINT_DELETED',
      entityType: 'Complaint',
      entityId: id,
    },
  });

  await prisma.complaint.delete({ where: { id } });

  return { id };
}
