import { PrismaClient } from '@prisma/client';
import { generateSeedData } from './seed-data.js';

const prisma = new PrismaClient();

async function runSeed() {
  const isReset = process.argv.includes('--reset');
  const env = process.env.NODE_ENV || 'development';

  console.log(`Starting seed script in environment: [${env}]...`);

  if (env === 'production') {
    throw new Error('Seed script cannot be executed in production environment!');
  }

  const existingCount = await prisma.employee.count();
  if (existingCount > 0 && !isReset) {
    console.warn(
      `⚠️ Database already contains ${existingCount} employee records. Seed aborted to protect data.\n` +
      `Pass --reset to explicitly clear and re-seed the development/test database.`
    );
    process.exit(0);
  }

  if (isReset) {
    console.log('🔄 --reset flag supplied. Clearing existing records (history first, then employees)...');
    await prisma.salaryHistory.deleteMany();
    await prisma.employee.deleteMany();
    await prisma.currency.deleteMany();
  }

  console.log('Generating deterministic dataset of 10,000 employees...');
  const { currencies, employees, salaryHistories } = generateSeedData({ count: 10000 });

  console.log('Upserting currencies...');
  for (const c of currencies) {
    await prisma.currency.upsert({
      where: { code: c.code },
      update: { decimalPlaces: c.decimalPlaces, usdRate: c.usdRate },
      create: { code: c.code, decimalPlaces: c.decimalPlaces, usdRate: c.usdRate },
    });
  }

  console.log('Inserting 10,000 employees in bounded batches of 1,000...');
  const BATCH_SIZE = 1000;
  for (let i = 0; i < employees.length; i += BATCH_SIZE) {
    const batch = employees.slice(i, i + BATCH_SIZE);
    await prisma.employee.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`  Inserted employees ${i + 1} to ${Math.min(i + BATCH_SIZE, employees.length)}`);
  }

  console.log('Inserting 10,000 initial salary histories in bounded batches of 1,000...');
  for (let i = 0; i < salaryHistories.length; i += BATCH_SIZE) {
    const batch = salaryHistories.slice(i, i + BATCH_SIZE);
    await prisma.salaryHistory.createMany({
      data: batch,
      skipDuplicates: true,
    });
    console.log(`  Inserted salary histories ${i + 1} to ${Math.min(i + BATCH_SIZE, salaryHistories.length)}`);
  }

  const totalEmployees = await prisma.employee.count();
  const totalHistories = await prisma.salaryHistory.count();
  console.log(`✅ Seed successfully completed! Employees: ${totalEmployees}, SalaryHistories: ${totalHistories}`);
}

runSeed()
  .catch((err) => {
    console.error('❌ Error during seeding:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

