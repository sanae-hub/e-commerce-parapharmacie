import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  console.log('🔧 Création d\'un utilisateur administrateur...\n');

  const adminData = {
    email: 'admin@parapharmacie.ma',
    password: 'Admin123!',
    firstName: 'Admin',
    lastName: 'ParaClick',
    phone: '+212 6 00 00 00 00',
    address: '123 Avenue Mohammed V, Casablanca',
    role: 'ADMIN'
  };

  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingAdmin) {
      console.log('⚠️  Un administrateur avec cet email existe déjà');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Rôle: ${existingAdmin.role}`);
      
      // Mettre à jour le rôle si nécessaire
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { email: adminData.email },
          data: { role: 'ADMIN' }
        });
        console.log('✅ Rôle mis à jour vers ADMIN');
      }
      
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        ...adminData,
        password: hashedPassword
      }
    });

    console.log('✅ Administrateur créé avec succès !\n');
    console.log('📧 Email:', adminData.email);
    console.log('🔑 Mot de passe:', adminData.password);
    console.log('👤 Nom:', `${adminData.firstName} ${adminData.lastName}`);
    console.log('🎯 Rôle:', adminData.role);
    console.log('\n⚠️  IMPORTANT: Changez le mot de passe après la première connexion !');
    console.log('\n🌐 Accès: http://localhost:3000/admin/login');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'administrateur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
