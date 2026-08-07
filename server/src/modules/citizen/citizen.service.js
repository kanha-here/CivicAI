import { prisma } from '../../prisma/client.js';
import { normalizePhoneNumber } from '../../services/whatsapp.service.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function getCitizenProfile(userId) {
  const [user, complaints, feedbackAgg, leaderboard] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.complaint.findMany({
      where: { citizenId: userId },
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: {
        department: true,
        statusHistory: { orderBy: { createdAt: 'desc' }, take: 1 },
        aiModelOutputs: { orderBy: { createdAt: 'asc' } },
        resolutionPredictions: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    }),
    prisma.feedback.aggregate({ where: { userId }, _avg: { rating: true }, _count: { id: true } }),
    prisma.complaint.groupBy({
      by: ['citizenId'],
      _count: { id: true },
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      orderBy: { _count: { id: 'desc' } },
    }),
  ]);

  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const totalReports = await prisma.complaint.count({ where: { citizenId: userId } });
  const resolvedReports = await prisma.complaint.count({
    where: { citizenId: userId, status: { in: ['RESOLVED', 'CLOSED'] } },
  });
  const rankIndex = leaderboard.findIndex((item) => item.citizenId === userId);
  const points = resolvedReports * 100 + totalReports * 25;
  const accuracy = totalReports ? Math.round((resolvedReports / totalReports) * 100) : 0;

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      role: user.role.toLowerCase(),
      createdAt: user.createdAt,
    },
    stats: {
      points,
      accuracy,
      totalReports,
      resolvedReports,
      rank: rankIndex >= 0 ? rankIndex + 1 : null,
      averageRating: Number(feedbackAgg._avg.rating || 0),
      feedbackCount: feedbackAgg._count.id,
      level: Math.max(1, Math.floor(points / 500) + 1),
    },
    timeline: complaints.map((complaint) => ({
      id: complaint.id,
      title: complaint.title,
      status: label(complaint.status),
      department: complaint.department?.name || 'Pending routing',
      time: complaint.statusHistory[0]?.createdAt || complaint.createdAt,
      description: complaint.statusHistory[0]?.note || `Complaint ${label(complaint.status)}`,
      estimatedResolutionHours: complaint.resolutionPredictions[0]?.estimatedResolutionHours || null,
      aiRecommendation: complaint.aiModelOutputs.find((output) => output.modelName === 'MODEL_2_CLASSIFICATION_SEVERITY')?.aiRecommendation || null,
    })),
  };
}

export async function getCommunitySummary() {
  const [totalCitizens, totalReports, resolvedReports, activeReports, departments] = await Promise.all([
    prisma.user.count({ where: { role: 'CITIZEN' } }),
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
    prisma.complaint.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] } } }),
    prisma.department.findMany({
      include: { _count: { select: { complaints: true } } },
      orderBy: { complaints: { _count: 'desc' } },
      take: 5,
    }),
  ]);

  return {
    stats: {
      totalCitizens,
      totalReports,
      resolvedReports,
      activeReports,
    },
    departments: departments.map((department) => ({
      id: department.id,
      name: department.name,
      description: department.description,
      reports: department._count.complaints,
    })),
  };
}

export async function updateCitizenProfile(userId, data) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const normalizedPhone =
    data.phone === undefined
      ? user.phone
      : data.phone
        ? normalizePhoneNumber(data.phone)
        : null;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      phone: normalizedPhone,
      address: data.address || user.address,
    },
  });

  await prisma.activityLog.create({
    data: {
      userId,
      action: 'PROFILE_UPDATED',
      entityType: 'User',
      entityId: userId,
      meta: {
        phoneUpdated: Boolean(data.phone),
        addressUpdated: Boolean(data.address),
      },
    },
  });

  return {
    id: updatedUser.id,
    name: updatedUser.name,
    email: updatedUser.email,
    phone: updatedUser.phone,
    address: updatedUser.address,
  };
}

export async function createSupportMessage(userId, data) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  const log = await prisma.activityLog.create({
    data: {
      userId,
      action: 'SUPPORT_MESSAGE_CREATED',
      entityType: 'SupportMessage',
      entityId: userId,
      meta: {
        requestType: data.requestType,
        subject: data.subject,
        message: data.message,
        replyTo: data.email || user.email,
      },
    },
  });

  return {
    id: log.id,
    requestType: data.requestType,
    submittedAt: log.createdAt,
  };
}
