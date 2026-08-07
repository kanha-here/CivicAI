import { prisma } from '../../prisma/client.js';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const PIE_COLORS = ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#64748b'];

function daysAgo(days) {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - days);
  return date;
}

function pct(part, total) {
  if (!total) return 0;
  return Math.round((part / total) * 100);
}

function normalizeStatus(status) {
  return String(status || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function averageResolutionHours(complaints) {
  if (!complaints.length) return null;
  const totalHours = complaints.reduce((sum, complaint) => {
    const created = new Date(complaint.createdAt).getTime();
    const updated = new Date(complaint.updatedAt).getTime();
    return sum + Math.max(updated - created, 0) / 36e5;
  }, 0);
  return Number((totalHours / complaints.length).toFixed(1));
}

export async function getDashboardSummary() {
  const sinceWeek = daysAgo(6);
  const sinceDay = daysAgo(1);

  const [
    totalActive,
    resolvedWeek,
    processing,
    highPriority,
    activityComplaints,
    categoryGroups,
    departmentGroups,
    recentComplaints,
    totalComplaints,
    totalFeedback,
    feedbackAgg,
    resolvedComplaintsForAverage,
  ] = await prisma.$transaction([
    prisma.complaint.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] } } }),
    prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] }, updatedAt: { gte: sinceWeek } } }),
    prisma.complaint.count({ where: { status: { in: ['TRIAGED', 'ASSIGNED', 'IN_PROGRESS'] } } }),
    prisma.complaint.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] }, status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
    prisma.complaint.findMany({ where: { createdAt: { gte: sinceWeek } }, select: { createdAt: true } }),
    prisma.prediction.groupBy({ by: ['category'], _count: { id: true }, orderBy: { _count: { id: 'desc' } }, take: 6 }),
    prisma.complaint.groupBy({ by: ['departmentId', 'status'], _count: { id: true }, where: { departmentId: { not: null } } }),
    prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      include: { department: true },
    }),
    prisma.complaint.count(),
    prisma.feedback.count(),
    prisma.feedback.aggregate({ _avg: { rating: true } }),
    prisma.complaint.findMany({
      where: { status: { in: ['RESOLVED', 'CLOSED'] } },
      select: { createdAt: true, updatedAt: true },
      take: 500,
    }),
  ]);

  const departments = await prisma.department.findMany({
    where: { id: { in: departmentGroups.map((group) => group.departmentId).filter(Boolean) } },
  });
  const departmentById = new Map(departments.map((department) => [department.id, department]));

  const activityData = Array.from({ length: 7 }).map((_, index) => {
    const date = daysAgo(6 - index);
    return {
      name: DAY_LABELS[date.getDay()],
      complaints: activityComplaints.filter((item) => item.createdAt.toDateString() === date.toDateString()).length,
    };
  });

  const totalPredictions = categoryGroups.reduce((sum, group) => sum + group._count.id, 0);
  const categoryData = categoryGroups.length
    ? categoryGroups.map((group, index) => ({
        name: group.category,
        value: pct(group._count.id, totalPredictions),
        color: PIE_COLORS[index % PIE_COLORS.length],
      }))
    : [];

  const workload = new Map();
  departmentGroups.forEach((group) => {
    const entry = workload.get(group.departmentId) || { dept: departmentById.get(group.departmentId)?.name || 'Unassigned', pending: 0, resolved: 0 };
    if (['RESOLVED', 'CLOSED'].includes(group.status)) entry.resolved += group._count.id;
    else entry.pending += group._count.id;
    workload.set(group.departmentId, entry);
  });

  const resolvedTotal = await prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } });
  const satisfaction = Number(feedbackAgg._avg.rating || 0);

  return {
    stats: {
      totalActive,
      resolvedWeek,
      processing,
      highPriority,
      totalResolutions: resolvedTotal,
      averageResolutionHours: averageResolutionHours(resolvedComplaintsForAverage),
      slaCompliance: pct(resolvedTotal, totalComplaints),
      citizenSatisfaction: satisfaction ? Number(satisfaction.toFixed(1)) : 0,
      feedbackCount: totalFeedback,
      newComplaintsDay: await prisma.complaint.count({ where: { createdAt: { gte: sinceDay } } }),
    },
    activityData,
    categoryData,
    departmentData: Array.from(workload.values()),
    recentActivity: recentComplaints.map((complaint) => ({
      id: complaint.id,
      title: complaint.title,
      status: normalizeStatus(complaint.status),
      priority: normalizeStatus(complaint.priority),
      time: complaint.createdAt,
      department: complaint.department?.name || 'Unassigned',
    })),
  };
}

export async function getGovernanceAnalytics() {
  const summary = await getDashboardSummary();
  const performanceData = summary.activityData.map((item) => ({
    name: item.name,
    incoming: item.complaints,
    resolved: Math.round(item.complaints * (summary.stats.slaCompliance / 100)),
    escalated: Math.max(0, Math.round(item.complaints * 0.12)),
  }));

  const departmentData = summary.departmentData.map((item) => {
    const total = item.pending + item.resolved;
    const compliance = pct(item.resolved, total);
    return {
      name: item.dept,
      compliance,
      SLA: 90,
    };
  });

  return {
    stats: summary.stats,
    performanceData,
    departmentData,
    topEscalations: summary.recentActivity.filter((item) => ['High', 'Critical'].includes(item.priority)).slice(0, 5),
  };
}

export async function getTrustAnalytics(complaintId) {
  const complaint = complaintId
    ? await prisma.complaint.findUnique({
        where: { id: complaintId },
        include: { statusHistory: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { name: true } } } }, predictions: true },
      })
    : await prisma.complaint.findFirst({
        orderBy: { createdAt: 'desc' },
        include: { statusHistory: { orderBy: { createdAt: 'asc' }, include: { changedBy: { select: { name: true } } } }, predictions: true },
      });

  const summary = await getDashboardSummary();

  return {
    complaintId: complaint?.id || null,
    timelineSteps: complaint
      ? complaint.statusHistory.map((history) => ({
          status: normalizeStatus(history.newStatus),
          time: history.createdAt,
          description: history.note || `Changed by ${history.changedBy?.name || 'system'}`,
          completed: true,
        }))
      : [],
    trustMetrics: {
      transparencyScore: summary.stats.slaCompliance,
      citizenSatisfaction: summary.stats.citizenSatisfaction,
      resolutionRate: summary.stats.slaCompliance,
      slaCompliance: summary.stats.slaCompliance,
    },
    prediction: complaint?.predictions[0] || null,
  };
}
