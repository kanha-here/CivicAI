import { prisma } from '../../prisma/client.js';

function label(value) {
  return String(value || '').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function listIncidents(currentUser) {
  const where = currentUser?.role === 'officer' ? { tasks: { some: { officerId: currentUser.id } } } : {};
  const incidents = await prisma.incident.findMany({
    where,
    orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }],
    take: 50,
    include: {
      complaint: { include: { department: true, predictions: true } },
      tasks: { include: { officer: { select: { id: true, name: true, email: true } } } },
    },
  });

  return incidents.map((incident) => ({
    id: incident.id,
    complaintId: incident.complaint?.id || null,
    type: incident.complaint?.department?.name || incident.complaint?.predictions[0]?.category || 'General',
    title: incident.complaint?.title || 'Incident',
    priority: label(incident.severity),
    severity: label(incident.severity),
    location: incident.location || 'Unmapped location',
    status: label(incident.status),
    reportsCount: incident.complaint ? 1 : 0,
    aiSummary: incident.complaint?.predictions[0]
      ? `${incident.complaint.predictions[0].category} prediction at ${incident.complaint.predictions[0].confidenceScore || 0}% confidence.`
      : 'No AI prediction is available yet.',
    action: incident.status === 'OPEN' ? 'Review and assign a field task.' : 'Continue monitoring assigned task progress.',
    sla: null,
    tasks: incident.tasks,
  }));
}

export async function getIncidentStats(currentUser) {
  const incidents = await listIncidents(currentUser);
  return {
    activeIncidents: incidents.length,
    criticalPriority: incidents.filter((incident) => incident.severity === 'Critical').length,
    slaBreaches: 0,
    autoResolvedRate: 0,
    fieldUnits: incidents.reduce((sum, incident) => sum + incident.tasks.length, 0),
    activeZones: new Set(incidents.map((incident) => incident.location)).size,
  };
}
