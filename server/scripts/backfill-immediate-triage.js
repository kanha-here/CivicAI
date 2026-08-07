import 'dotenv/config';
import { prisma } from '../src/prisma/client.js';
import { predictModel1Heuristic, sanitizeComplaintInput } from '../src/services/prediction.service.js';

const complaintId = process.argv[2];

if (!complaintId) {
  console.error('Usage: node scripts/backfill-immediate-triage.js <complaint-id>');
  process.exitCode = 1;
} else {
  const complaint = await prisma.complaint.findUnique({ where: { id: complaintId } });

  if (!complaint) {
    console.error(`Complaint not found: ${complaintId}`);
    process.exitCode = 1;
  } else {
    const text = sanitizeComplaintInput(`${complaint.title}. ${complaint.description}`);
    const prediction = predictModel1Heuristic(text);
    const saved = await prisma.prediction.create({
      data: {
        complaintId,
        category: 'Immediate citizen triage',
        confidenceScore: prediction.priority_confidence,
        validity: prediction.validity,
        validityConfidence: prediction.validity_confidence,
        priority: prediction.priority,
        priorityConfidence: prediction.priority_confidence,
        trustScore: prediction.trust_score,
      },
    });

    console.log(JSON.stringify({
      complaintId,
      predictionId: saved.id,
      validity: prediction.validity,
      priority: prediction.priority,
      validityConfidence: prediction.validity_confidence,
      priorityConfidence: prediction.priority_confidence,
      trustScore: prediction.trust_score,
    }, null, 2));
  }
}

await prisma.$disconnect();
