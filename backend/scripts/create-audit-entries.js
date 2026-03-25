import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAuditLogEntries() {
  console.log('🔧 Création d\'entrées de test dans le journal d\'audit...\n');

  // Récupérer l'admin et quelques utilisateurs
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@parapharmacie.ma' }
  });

  const caissier = await prisma.user.findUnique({
    where: { email: 'caissier@parapharmacie.ma' }
  });

  const client = await prisma.user.findUnique({
    where: { email: 'client1@parapharmacie.ma' }
  });

  if (!admin || !caissier || !client) {
    console.log('❌ Utilisateurs requis non trouvés');
    return;
  }

  const auditEntries = [
    {
      userId: admin.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: admin.id,
      description: 'Connexion administrateur'
    },
    {
      userId: admin.id,
      action: 'UPDATE',
      entityType: 'User',
      entityId: caissier.id,
      oldValues: { role: 'CLIENT' },
      newValues: { role: 'CAISSIER' },
      description: 'Modification du rôle utilisateur'
    },
    {
      userId: admin.id,
      action: 'ACTIVATE',
      entityType: 'User',
      entityId: client.id,
      oldValues: { isActive: false },
      newValues: { isActive: true },
      description: 'Activation du compte client'
    },
    {
      userId: caissier.id,
      action: 'UPDATE',
      entityType: 'Order',
      entityId: 'order-123',
      description: 'Mise à jour du statut de commande'
    },
    {
      userId: admin.id,
      action: 'CREATE',
      entityType: 'TimeSlotConfig',
      entityId: 'slot-456',
      description: 'Création d\'une configuration de créneau'
    },
    {
      userId: admin.id,
      action: 'DELETE',
      entityType: 'BlockedSlot',
      entityId: 'block-789',
      description: 'Suppression d\'un créneau bloqué'
    }
  ];

  for (const entry of auditEntries) {
    try {
      // Créer l'entrée avec une date légèrement différente pour chaque
      const createdAt = new Date();
      createdAt.setMinutes(createdAt.getMinutes() - Math.random() * 1440); // Dernières 24h

      await prisma.auditLog.create({
        data: {
          ...entry,
          ipAddress: '192.168.1.' + Math.floor(Math.random() * 255),
          userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          createdAt
        }
      });

      console.log(`✅ Entrée audit créée: ${entry.action} - ${entry.description}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la création d'une entrée audit:`, error.message);
    }
  }

  console.log('\n🎉 Création des entrées d\'audit terminée!');
}

createAuditLogEntries()
  .catch((e) => {
    console.error('Erreur générale:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });