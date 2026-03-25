import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true
      }
    });

    console.log('🔍 Utilisateurs actuels dans la base de données:\n');

    users.forEach(user => {
      console.log(`- ${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });

    console.log(`\n📊 Total: ${users.length} utilisateurs`);

  } catch (error) {
    console.error('❌ Erreur lors de la récupération des utilisateurs:', error);
  } finally {
    await prisma.$disconnect();
  }
}

listUsers();