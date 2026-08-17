import 'dotenv/config';
import bcrypt from 'bcrypt';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@smarthr.local' },
    update: {},
    create: {
      fullName: 'SmartHR Admin',
      email: 'admin@smarthr.local',
      password: passwordHash,
      role: 'admin',
      status: 'active',
      provider: 'local',
    },
  });

  const employer = await prisma.user.upsert({
    where: { email: 'employer@smarthr.local' },
    update: {},
    create: {
      fullName: 'Acme Employer',
      email: 'employer@smarthr.local',
      password: passwordHash,
      role: 'employer',
      status: 'active',
      provider: 'local',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'seed:init',
      ipAddress: '127.0.0.1',
      userAgent: 'prisma-seed',
    },
  });

  console.log(`Seeded users: admin=${admin.id}, employer=${employer.id}`);
}

main()
  .catch((error) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
