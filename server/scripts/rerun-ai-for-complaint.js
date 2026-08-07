import 'dotenv/config';
import { rerunAIProcessing } from '../src/services/ai-orchestrator.service.js';
import { prisma } from '../src/prisma/client.js';

const complaintId = process.argv[2];

if (!complaintId) {
  console.error('Usage: node scripts/rerun-ai-for-complaint.js <complaint-id>');
  process.exitCode = 1;
} else {
  const outputs = await rerunAIProcessing(complaintId);
  console.log(JSON.stringify(outputs.map((output) => ({
    modelName: output.modelName,
    status: output.status,
    classification: output.classification,
    suggestedDepartment: output.suggestedDepartment,
    priorityLevel: output.priorityLevel,
    confidenceScore: Number(output.confidenceScore || 0),
    fallbackUsed: Boolean(output.processedOutput?.fallbackUsed),
    error: output.errorLog?.message || null,
  })), null, 2));
}

await prisma.$disconnect();
