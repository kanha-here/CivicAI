import { prisma } from '../../prisma/client.js';

function badgeFor(rank) {
  if (rank === 1) return 'Gold';
  if (rank === 2) return 'Silver';
  if (rank === 3) return 'Bronze';
  return 'Hero';
}

export async function getLeaderboard(currentUser) {
  const grouped = await prisma.complaint.groupBy({
    by: ['citizenId'],
    _count: { id: true },
    where: { status: { in: ['RESOLVED', 'CLOSED'] } },
    orderBy: { _count: { id: 'desc' } },
    take: 20,
  });

  const users = await prisma.user.findMany({
    where: { id: { in: grouped.map((item) => item.citizenId) } },
    select: {
      id: true,
      name: true,
      complaints: {
        include: {
          feedback: true,
          aiModelOutputs: true,
          resolutionPredictions: true,
        },
      },
    },
  });
  const userById = new Map(users.map((user) => [user.id, user]));

  const leaders = grouped
    .map((item) => {
      const user = userById.get(item.citizenId);
      const complaints = user?.complaints || [];
      const resolved = complaints.filter((complaint) => ['RESOLVED', 'CLOSED'].includes(complaint.status));
      const highPriorityHandled = resolved.filter((complaint) => ['HIGH', 'CRITICAL'].includes(complaint.priority)).length;
      const feedback = complaints.flatMap((complaint) => complaint.feedback);
      const aiOutputs = complaints.flatMap((complaint) => complaint.aiModelOutputs);
      const resolutionPredictions = complaints.flatMap((complaint) => complaint.resolutionPredictions);
      const avgCompletionHours = resolved.length
        ? resolved.reduce((sum, complaint) => sum + Math.max(0, new Date(complaint.updatedAt).getTime() - new Date(complaint.createdAt).getTime()) / 36e5, 0) / resolved.length
        : 0;
      const citizenSatisfactionScore = feedback.length
        ? Math.round((feedback.reduce((sum, entry) => sum + entry.rating, 0) / feedback.length) * 20)
        : 75;
      const resolutionAccuracy = resolutionPredictions.length
        ? Math.round(resolutionPredictions.reduce((sum, entry) => sum + Number(entry.accuracyScore || 75), 0) / resolutionPredictions.length)
        : 75;
      const aiEfficiencyScore = aiOutputs.length
        ? Math.round(aiOutputs.reduce((sum, output) => sum + Number(output.confidenceScore || 75), 0) / aiOutputs.length)
        : 75;
      const aiRecommendationComplianceScore = aiOutputs.length
        ? Math.round((aiOutputs.filter((output) => output.suggestedDepartment).length / aiOutputs.length) * 100)
        : 70;
      const highPriorityComplaintHandlingScore = Math.min(100, highPriorityHandled * 20 + 60);
      const averageCompletionTimeScore = avgCompletionHours ? Math.max(20, Math.round(100 - avgCompletionHours)) : 70;
      const points = Math.round(
        item._count.id * 100
        + aiEfficiencyScore
        + resolutionAccuracy
        + citizenSatisfactionScore
        + highPriorityComplaintHandlingScore
        + aiRecommendationComplianceScore
        + averageCompletionTimeScore,
      );

      return {
        userId: item.citizenId,
        name: user?.name || 'Citizen',
        reports: item._count.id,
        points,
        metrics: {
          aiEfficiencyScore,
          resolutionAccuracy,
          citizenSatisfactionScore,
          averageCompletionHours: Number(avgCompletionHours.toFixed(1)),
          highPriorityComplaintHandlingScore,
          aiRecommendationComplianceScore,
        },
      };
    })
    .sort((a, b) => b.points - a.points)
    .map((leader, index) => ({
      ...leader,
      rank: index + 1,
      badge: badgeFor(index + 1),
    }));

  const current = leaders.find((leader) => leader.userId === currentUser.id);
  return {
    leaders,
    me: current || { rank: null, points: 0, reports: 0, badge: 'Starter' },
  };
}
