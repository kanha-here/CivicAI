import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

export const prisma =
  globalForPrisma.__prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
    transactionOptions: {
      maxWait: 15000,
      timeout: 20000,
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__prisma = prisma;
}
