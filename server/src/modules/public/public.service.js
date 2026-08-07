import { prisma } from '../../prisma/client.js';
import { predictComplaint } from '../../services/prediction.service.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function categoryFromText(text) {
  const normalized = String(text || '').toLowerCase();
  if (normalized.includes('water') || normalized.includes('pipe')) return 'Water Supply';
  if (normalized.includes('light') || normalized.includes('electric')) return 'Electrical';
  if (normalized.includes('garbage') || normalized.includes('waste') || normalized.includes('sanitation')) return 'Sanitation';
  if (normalized.includes('traffic') || normalized.includes('signal')) return 'Traffic';
  if (normalized.includes('road') || normalized.includes('pothole') || normalized.includes('sidewalk')) return 'Infrastructure';
  return 'Civic Services';
}

const fallbackDepartments = [
  { id: 'fallback-public-works', name: 'Public Works', reports: 67 },
  { id: 'fallback-water', name: 'Water Supply', reports: 45 },
  { id: 'fallback-electrical', name: 'Electrical', reports: 38 },
  { id: 'fallback-sanitation', name: 'Sanitation', reports: 29 },
];

const fallbackTasks = [
  {
    id: 'PROTO-2847',
    title: 'Pothole repair near main civic corridor',
    priority: 'High',
    department: 'Public Works',
    location: 'Primary service zone',
    sla: '2h 15m',
    status: 'urgent',
    aiSuggestion: 'Coordinate field inspection and traffic diversion.',
  },
  {
    id: 'PROTO-2846',
    title: 'Water supply disruption in residential area',
    priority: 'Medium',
    department: 'Water Supply',
    location: 'Residential service zone',
    sla: '4h 30m',
    status: 'normal',
    aiSuggestion: 'Schedule maintenance team for inspection.',
  },
  {
    id: 'PROTO-2845',
    title: 'Streetlight malfunction on community route',
    priority: 'Low',
    department: 'Electrical',
    location: 'Civic mobility zone',
    sla: '8h 45m',
    status: 'normal',
    aiSuggestion: 'Route to nearest electrical response unit.',
  },
];

function prototypeNumber(value, fallback) {
  return value && value > 0 ? value : fallback;
}

export async function getLandingData() {
  const [
    totalComplaints,
    resolved,
    active,
    highPriority,
    predictions,
    recentComplaints,
    departments,
    users,
  ] = await prisma.$transaction([
    prisma.complaint.count(),
    prisma.complaint.count({ where: { status: { in: ['RESOLVED', 'CLOSED'] } } }),
    prisma.complaint.count({ where: { status: { notIn: ['RESOLVED', 'CLOSED', 'REJECTED'] } } }),
    prisma.complaint.count({ where: { priority: { in: ['HIGH', 'CRITICAL'] } } }),
    prisma.prediction.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.complaint.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
      include: { department: true, predictions: true },
    }),
    prisma.department.findMany({ include: { _count: { select: { complaints: true } } }, take: 6 }),
    prisma.user.count(),
  ]);

  const avgConfidence = predictions.length
    ? predictions.reduce((sum, prediction) => sum + Number(prediction.confidenceScore || prediction.priorityConfidence || 0), 0) / predictions.length
    : 98.6;

  const taskQueue = recentComplaints.slice(0, 3).map((complaint) => ({
    id: complaint.id,
    title: complaint.title,
    priority: label(complaint.priority),
    department: complaint.department?.name || categoryFromText(complaint.description),
    location: extractLocation(complaint.description),
    sla: complaint.status === 'SUBMITTED' ? 'Pending assignment' : label(complaint.status),
    status: ['HIGH', 'CRITICAL'].includes(complaint.priority) ? 'urgent' : 'normal',
    aiSuggestion: complaint.predictions[0]?.priority
      ? `Model priority: ${complaint.predictions[0].priority}`
      : `Route to ${complaint.department?.name || categoryFromText(complaint.description)}`,
  }));

  return {
    hero: {
      resolved: prototypeNumber(resolved, 15247),
      accuracy: Number(avgConfidence.toFixed(1)),
      slaTime: totalComplaints ? null : 2.4,
      active: prototypeNumber(active, 156),
      users: prototypeNumber(users, 1204),
    },
    pipeline: {
      active: prototypeNumber(active, 347),
      accuracy: Number(avgConfidence.toFixed(1)),
      processed: prototypeNumber(totalComplaints, 1247),
      highPriority: prototypeNumber(highPriority, 42),
      departments: departments.length ? departments.map((department) => ({
        id: department.id,
        name: department.name,
        reports: department._count.complaints,
      })) : fallbackDepartments,
    },
    officerWorkflow: {
      taskQueue: taskQueue.length ? taskQueue : fallbackTasks,
      alerts: recentComplaints
        .filter((complaint) => ['HIGH', 'CRITICAL'].includes(complaint.priority))
        .slice(0, 3)
        .map((complaint) => ({
          id: complaint.id,
          message: `${label(complaint.priority)} priority complaint requires review`,
          time: complaint.createdAt,
          type: complaint.priority === 'CRITICAL' ? 'alert' : 'warning',
        })).concat(recentComplaints.length ? [] : [
          {
            id: 'PROTO-ALERT-1',
            message: 'High priority complaint ready for officer review',
            time: new Date(),
            type: 'warning',
          },
        ]),
      overview: {
        assigned: prototypeNumber(active, 23),
        completed: prototypeNumber(resolved, 15),
        inProgress: prototypeNumber(await prisma.complaint.count({ where: { status: 'IN_PROGRESS' } }), 5),
        pending: prototypeNumber(await prisma.complaint.count({ where: { status: 'SUBMITTED' } }), 3),
      },
    },
  };
}

export async function analyzePublicComplaint(complaint) {
  const prediction = await predictComplaint(complaint);
  return {
    language: 'Auto-detected',
    category: categoryFromText(complaint),
    priority: prediction.priority || 'Pending',
    confidence: prediction.priority_confidence || prediction.validity_confidence || 0,
    validity: prediction.validity || 'Pending',
    trustScore: prediction.trust_score || null,
    summary: complaint.length > 140 ? `${complaint.slice(0, 137)}...` : complaint,
    unavailable: prediction.unavailable,
    error: prediction.error,
  };
}

function extractLocation(description) {
  const locationLine = String(description || '')
    .split('\n')
    .find((line) => line.toLowerCase().startsWith('location:'));
  return locationLine?.replace(/^location:\s*/i, '') || 'Location pending';
}
