import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

console.log('Prisma keys:', Object.keys(prisma).filter(k => !k.startsWith('_')));
console.log('employeeSchedule exists:', !!prisma.employeeSchedule);

await prisma.$disconnect();
process.exit(0);
