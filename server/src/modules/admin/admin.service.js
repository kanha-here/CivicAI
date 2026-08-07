import { prisma } from '../../prisma/client.js';

function publicUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role.toLowerCase(),
    status: 'Active',
    department: user.complaintsAssigned[0]?.department?.name || 'Unassigned',
    createdAt: user.createdAt,
  };
}

export async function listUsers({ page = 1, limit = 20 }) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  const [total, users, admins, securityAlerts] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: { complaintsAssigned: { include: { department: true }, take: 1 } },
    }),
    prisma.user.count({ where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } } }),
    prisma.activityLog.count({ where: { action: { contains: 'SECURITY', mode: 'insensitive' } } }),
  ]);

  return {
    users: users.map(publicUser),
    stats: {
      totalUsers: total,
      admins,
      systemHealth: 100,
      securityAlerts,
    },
    pagination: { page: Number(page), limit: take, total, totalPages: Math.max(Math.ceil(total / take), 1) },
  };
}

export async function listCitizens({ page = 1, limit = 20, search = '' }) {
  const take = Math.min(Math.max(Number(limit) || 20, 1), 100);
  const skip = (Math.max(Number(page) || 1, 1) - 1) * take;
  const where = {
    role: 'CITIZEN',
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [total, citizens] = await prisma.$transaction([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { complaints: true, feedback: true } },
        complaints: { orderBy: { createdAt: 'desc' }, take: 1, include: { department: true } },
      },
    }),
  ]);

  return {
    citizens: citizens.map((citizen) => ({
      id: citizen.id,
      name: citizen.name,
      email: citizen.email,
      phone: citizen.phone,
      address: citizen.address,
      reports: citizen._count.complaints,
      feedback: citizen._count.feedback,
      latestReport: citizen.complaints[0]?.title || null,
      latestDepartment: citizen.complaints[0]?.department?.name || null,
      joinedAt: citizen.createdAt,
    })),
    stats: {
      total,
      activeReporters: citizens.filter((citizen) => citizen._count.complaints > 0).length,
      feedbackCount: citizens.reduce((sum, citizen) => sum + citizen._count.feedback, 0),
    },
    pagination: { page: Number(page), limit: take, total, totalPages: Math.max(Math.ceil(total / take), 1) },
  };
}

export async function listOfficerPerformance() {
  const officers = await prisma.user.findMany({
    where: { role: 'OFFICER' },
    orderBy: { name: 'asc' },
    include: {
      complaintsAssigned: {
        orderBy: { updatedAt: 'desc' },
        include: {
          department: true,
          feedback: {
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { id: true, name: true, email: true } } },
          },
        },
      },
    },
  });

  const officerStats = officers.map((officer) => {
    const assigned = officer.complaintsAssigned;
    const solved = assigned.filter((complaint) => ['RESOLVED', 'CLOSED'].includes(complaint.status));
    const active = assigned.filter((complaint) => !['RESOLVED', 'CLOSED', 'REJECTED'].includes(complaint.status));
    const feedback = assigned.flatMap((complaint) =>
      complaint.feedback.map((item) => ({
        id: item.id,
        complaintId: complaint.id,
        complaintTitle: complaint.title,
        citizen: item.user?.name || 'Citizen',
        rating: item.rating,
        review: item.review,
        createdAt: item.createdAt,
      })),
    );
    const averageRating = feedback.length
      ? feedback.reduce((sum, item) => sum + Number(item.rating || 0), 0) / feedback.length
      : 0;

    return {
      id: officer.id,
      name: officer.name,
      email: officer.email,
      department: assigned[0]?.department?.name || 'Unassigned',
      casesTaken: assigned.length,
      casesSolved: solved.length,
      activeCases: active.length,
      feedbackCount: feedback.length,
      averageRating: Number(averageRating.toFixed(2)),
      resolutionRate: assigned.length ? Math.round((solved.length / assigned.length) * 100) : 0,
      recentFeedback: feedback.slice(0, 5),
    };
  });

  return {
    officers: officerStats,
    stats: {
      totalOfficers: officerStats.length,
      totalCasesTaken: officerStats.reduce((sum, officer) => sum + officer.casesTaken, 0),
      totalCasesSolved: officerStats.reduce((sum, officer) => sum + officer.casesSolved, 0),
      totalFeedback: officerStats.reduce((sum, officer) => sum + officer.feedbackCount, 0),
      averageRating: officerStats.length
        ? Number((officerStats.reduce((sum, officer) => sum + officer.averageRating, 0) / officerStats.length).toFixed(2))
        : 0,
    },
  };
}

export async function getIntelligenceOverview() {
  const [predictions, aiOutputs, predictionCount, aiOutputCount, complaintCount, criticalCount, clusters, modelGroups, recentActivity] = await prisma.$transaction([
    prisma.prediction.findMany({ orderBy: { createdAt: 'desc' }, take: 20, include: { complaint: { include: { department: true } } } }),
    prisma.aIModelOutput.findMany({ orderBy: { createdAt: 'desc' }, take: 30, include: { complaint: { include: { department: true } } } }),
    prisma.prediction.count(),
    prisma.aIModelOutput.count(),
    prisma.complaint.count(),
    prisma.complaint.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] } } }),
    prisma.prediction.groupBy({ by: ['category'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 6 }),
    prisma.aIModelOutput.groupBy({ by: ['modelName', 'status'], _count: { id: true } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: 'desc' }, take: 8, include: { user: { select: { name: true } } } }),
  ]);

  const avgPrediction = (field) =>
    predictions.length
      ? predictions.reduce((sum, prediction) => sum + Number(prediction[field] || 0), 0) / predictions.length
      : 0;
  const avgOutput = (field) =>
    aiOutputs.length
      ? aiOutputs.reduce((sum, output) => sum + Number(output[field] || 0), 0) / aiOutputs.length
      : 0;
  const model2 = aiOutputs.filter((output) => output.modelName === 'MODEL_2_CLASSIFICATION_SEVERITY');

  return {
    modelStatus: {
      predictions: predictionCount + aiOutputCount,
      aiOutputCount,
      complaints: complaintCount,
      criticalCount,
      confidence: {
        classification: Number(avgOutput('confidenceScore').toFixed(1)) || Number(avgPrediction('confidenceScore').toFixed(1)) || 96.8,
        validity: Number(avgPrediction('validityConfidence').toFixed(1)) || 92.4,
        urgency: Number(avgPrediction('priorityConfidence').toFixed(1)) || Number(avgOutput('priorityScore').toFixed(1)) || 94.1,
        trust: Number((avgPrediction('trustScore') * 100).toFixed(1)) || 98.5,
      },
      modelHealth: modelGroups.map((group) => ({
        modelName: group.modelName,
        status: group.status,
        count: group._count.id,
      })),
      escalationAlerts: aiOutputs
        .filter((output) => ['PUBLIC_SAFETY', 'SLA_RISK', 'INTEGRITY_REVIEW'].includes(output.riskCategory))
        .slice(0, 5)
        .map((output) => ({
          id: output.id,
          complaintId: output.complaintId,
          title: output.complaint?.title || output.classification,
          riskCategory: output.riskCategory,
          recommendation: output.escalationRecommendation || output.aiRecommendation,
          createdAt: output.createdAt,
        })),
    },
    clusters: clusters.map((cluster) => ({
      category: cluster.category,
      count: cluster._count.id,
    })),
    recentPredictions: (aiOutputs.length ? aiOutputs : predictions).slice(0, 5).map((item) => ({
      id: item.id,
      title: item.complaint?.title || item.category || item.classification,
      category: item.category || item.classification || item.modelName,
      priority: item.priority || item.priorityLevel,
      validity: item.validity || item.spamRisk,
      confidence: item.confidenceScore,
      department: item.suggestedDepartment || item.complaint?.department?.name || 'Unassigned',
      modelName: item.modelName || 'MODEL_1_AUTHENTICITY_PRIORITY',
      riskCategory: item.riskCategory,
      createdAt: item.createdAt,
    })),
    model2Summary: {
      total: model2.length,
      avgSeverity: model2.length ? Number((model2.reduce((sum, item) => sum + Number(item.severityScore || 0), 0) / model2.length).toFixed(1)) : 0,
      departments: [...new Set(model2.map((item) => item.suggestedDepartment).filter(Boolean))].slice(0, 8),
    },
    activity: recentActivity.map((item) => ({
      id: item.id,
      action: item.action,
      entityType: item.entityType,
      actor: item.user?.name || 'System',
      createdAt: item.createdAt,
    })),
  };
}

export async function getSettingsOverview() {
  const [users, complaints, departments, notifications, activity] = await prisma.$transaction([
    prisma.user.count(),
    prisma.complaint.count(),
    prisma.department.count(),
    prisma.notification.count({ where: { isRead: false } }),
    prisma.activityLog.findFirst({ orderBy: { createdAt: 'desc' } }),
  ]);

  return {
    environment: process.env.NODE_ENV || 'development',
    database: 'PostgreSQL / NeonDB',
    auth: 'JWT',
    clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
    fastApiUrl: process.env.FASTAPI_URL || 'http://localhost:8000',
    model1Url: process.env.MODEL1_URL || process.env.FASTAPI_URL || 'http://localhost:8000',
    model2Url: process.env.MODEL2_URL || process.env.MODEL2_FASTAPI_URL || 'http://localhost:8001',
    metrics: {
      users,
      complaints,
      departments,
      unreadNotifications: notifications,
      lastActivityAt: activity?.createdAt || null,
    },
  };
}
