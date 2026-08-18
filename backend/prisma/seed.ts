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

  const recruiter = await prisma.user.upsert({
    where: { email: 'employer@smarthr.local' },
    update: {},
    create: {
      fullName: 'Acme Recruiter',
      email: 'employer@smarthr.local',
      password: passwordHash,
      role: 'recruiter',
      status: 'active',
      provider: 'local',
      recruiterProfile: {
        create: {
          companyName: 'Acme',
          industry: 'Technology',
          jobTitle: 'Talent Partner',
          country: 'United States',
        },
      },
    },
  });

  const candidate = await prisma.user.upsert({
    where: { email: 'candidate@smarthr.local' },
    update: {},
    create: {
      fullName: 'Ada Candidate',
      email: 'candidate@smarthr.local',
      password: passwordHash,
      role: 'candidate',
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

  console.log(`Seeded users: admin=${admin.id}, recruiter=${recruiter.id}, candidate=${candidate.id}`);
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
