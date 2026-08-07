import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const departments = [
  { name: 'Public Works', description: 'Roads, bridges, and public infrastructure' },
  { name: 'Water Supply', description: 'Water distribution and pipeline operations' },
  { name: 'Sanitation', description: 'Waste collection and cleanliness operations' },
  { name: 'Electrical', description: 'Streetlights and public electrical maintenance' },
  { name: 'Traffic', description: 'Traffic safety and mobility operations' },
];

async function main() {
  await Promise.all(
    departments.map((department) =>
      prisma.department.upsert({
        where: { name: department.name },
        update: department,
        create: department,
      }),
    ),
  );

  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const passwordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD, 12);
    await prisma.user.upsert({
      where: { email: process.env.SEED_ADMIN_EMAIL },
      update: { passwordHash, role: 'SUPER_ADMIN' },
      create: {
        name: process.env.SEED_ADMIN_NAME || 'System Administrator',
        email: process.env.SEED_ADMIN_EMAIL,
        passwordHash,
        role: 'SUPER_ADMIN',
      },
    });
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
