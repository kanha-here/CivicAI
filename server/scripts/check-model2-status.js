import 'dotenv/config';
import { prisma } from '../src/prisma/client.js';

const outputs = await prisma.aIModelOutput.findMany({
  where: { modelName: 'MODEL_2_CLASSIFICATION_SEVERITY' },
  orderBy: { createdAt: 'desc' },
  take: 10,
  select: {
    id: true,
    complaintId: true,
    status: true,
    confidenceScore: true,
    classification: true,
    suggestedDepartment: true,
    priorityLevel: true,
    severityScore: true,
    errorLog: true,
    processedOutput: true,
    createdAt: true,
  },
});

const total = await prisma.aIModelOutput.count({
  where: { modelName: 'MODEL_2_CLASSIFICATION_SEVERITY' },
});

console.log(JSON.stringify({
  totalModel2Outputs: total,
  latest: outputs.map((output) => ({
    complaintId: output.complaintId,
    status: output.status,
    classification: output.classification,
    suggestedDepartment: output.suggestedDepartment,
    priorityLevel: output.priorityLevel,
    severityScore: Number(output.severityScore || 0),
    confidenceScore: Number(output.confidenceScore || 0),
    fallbackUsed: Boolean(output.processedOutput?.fallbackUsed),
    error: output.errorLog?.message || null,
    createdAt: output.createdAt,
  })),
}, null, 2));

await prisma.$disconnect();
