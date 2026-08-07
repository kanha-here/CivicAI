CREATE TYPE "AIExecutionStatus" AS ENUM ('QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'SKIPPED');

CREATE TABLE "AIModelOutput" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "modelName" TEXT NOT NULL,
    "modelVersion" TEXT,
    "status" "AIExecutionStatus" NOT NULL DEFAULT 'QUEUED',
    "confidenceScore" DECIMAL(5,2),
    "aiRecommendation" TEXT,
    "priorityScore" DECIMAL(5,2),
    "severityAnalysis" TEXT,
    "severityScore" DECIMAL(5,2),
    "emergencyLevel" TEXT,
    "estimatedResolutionHours" INTEGER,
    "suggestedDepartment" TEXT,
    "suggestedOfficerId" UUID,
    "riskCategory" TEXT,
    "classification" TEXT,
    "priorityLevel" TEXT,
    "escalationRecommendation" TEXT,
    "areaImpact" TEXT,
    "spamRisk" TEXT,
    "rawOutput" JSONB,
    "processedOutput" JSONB,
    "metadata" JSONB,
    "errorLog" JSONB,
    "processingStartedAt" TIMESTAMP(3),
    "processingCompletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIModelOutput_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ModelAnalytics" (
    "id" UUID NOT NULL,
    "modelName" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalRuns" INTEGER NOT NULL DEFAULT 0,
    "successfulRuns" INTEGER NOT NULL DEFAULT 0,
    "failedRuns" INTEGER NOT NULL DEFAULT 0,
    "avgConfidence" DECIMAL(5,2),
    "avgProcessingMs" INTEGER,
    "highRiskCount" INTEGER NOT NULL DEFAULT 0,
    "escalationCount" INTEGER NOT NULL DEFAULT 0,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ModelAnalytics_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "PredictionLog" (
    "id" UUID NOT NULL,
    "complaintId" UUID,
    "modelName" TEXT NOT NULL,
    "status" "AIExecutionStatus" NOT NULL,
    "attempt" INTEGER NOT NULL DEFAULT 1,
    "durationMs" INTEGER,
    "inputMetadata" JSONB,
    "outputMetadata" JSONB,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PredictionLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ResolutionPrediction" (
    "id" UUID NOT NULL,
    "complaintId" UUID NOT NULL,
    "aiModelOutputId" UUID,
    "modelName" TEXT NOT NULL,
    "estimatedResolutionHours" INTEGER NOT NULL,
    "estimatedResolvedAt" TIMESTAMP(3),
    "actualResolutionHours" DECIMAL(8,2),
    "accuracyScore" DECIMAL(5,2),
    "priorityLevel" "PriorityLevel",
    "riskCategory" TEXT,
    "officerEfficiencyScore" DECIMAL(5,2),
    "performanceMetrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResolutionPrediction_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AIModelOutput_complaintId_modelName_key" ON "AIModelOutput"("complaintId", "modelName");
CREATE INDEX "AIModelOutput_complaintId_idx" ON "AIModelOutput"("complaintId");
CREATE INDEX "AIModelOutput_modelName_status_idx" ON "AIModelOutput"("modelName", "status");
CREATE INDEX "AIModelOutput_riskCategory_idx" ON "AIModelOutput"("riskCategory");
CREATE INDEX "AIModelOutput_priorityLevel_idx" ON "AIModelOutput"("priorityLevel");

CREATE UNIQUE INDEX "ModelAnalytics_modelName_date_key" ON "ModelAnalytics"("modelName", "date");
CREATE INDEX "ModelAnalytics_modelName_idx" ON "ModelAnalytics"("modelName");
CREATE INDEX "ModelAnalytics_date_idx" ON "ModelAnalytics"("date");

CREATE INDEX "PredictionLog_complaintId_idx" ON "PredictionLog"("complaintId");
CREATE INDEX "PredictionLog_modelName_status_idx" ON "PredictionLog"("modelName", "status");
CREATE INDEX "PredictionLog_createdAt_idx" ON "PredictionLog"("createdAt");

CREATE INDEX "ResolutionPrediction_complaintId_idx" ON "ResolutionPrediction"("complaintId");
CREATE INDEX "ResolutionPrediction_modelName_idx" ON "ResolutionPrediction"("modelName");
CREATE INDEX "ResolutionPrediction_riskCategory_idx" ON "ResolutionPrediction"("riskCategory");

ALTER TABLE "AIModelOutput" ADD CONSTRAINT "AIModelOutput_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "AIModelOutput" ADD CONSTRAINT "AIModelOutput_suggestedOfficerId_fkey" FOREIGN KEY ("suggestedOfficerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PredictionLog" ADD CONSTRAINT "PredictionLog_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "ResolutionPrediction" ADD CONSTRAINT "ResolutionPrediction_complaintId_fkey" FOREIGN KEY ("complaintId") REFERENCES "Complaint"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ResolutionPrediction" ADD CONSTRAINT "ResolutionPrediction_aiModelOutputId_fkey" FOREIGN KEY ("aiModelOutputId") REFERENCES "AIModelOutput"("id") ON DELETE SET NULL ON UPDATE CASCADE;
