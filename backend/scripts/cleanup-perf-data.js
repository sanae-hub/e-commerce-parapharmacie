import prisma from '../src/prismaClient.js';

// Supprimer toutes les commandes des comptes de test perf
const testEmails = [
  'client@test.com',
  'admin@parapharmacie.ma',
];

// Trouver les clients de test
const clients = await prisma.client.findMany({
  where: { email: { in: testEmails } },
  select: { id: true, email: true }
});

console.log('Clients trouvés:', clients.map(c => c.email));

for (const client of clients) {
  // D'abord supprimer les orderItems
  const orders = await prisma.order.findMany({
    where: { clientId: client.id },
    select: { id: true }
  });
  
  if (orders.length > 0) {
    const orderIds = orders.map(o => o.id);
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    const deleted = await prisma.order.deleteMany({ where: { clientId: client.id } });
    console.log(`${client.email}: ${deleted.count} commandes supprimées`);
  } else {
    console.log(`${client.email}: aucune commande`);
  }
}

// Supprimer aussi les comptes perf_user_* créés par le test 07
const perfClients = await prisma.client.findMany({
  where: { email: { startsWith: 'perf_user_' } },
  select: { id: true, email: true }
});

if (perfClients.length > 0) {
  const perfIds = perfClients.map(c => c.id);
  const perfOrders = await prisma.order.findMany({
    where: { clientId: { in: perfIds } },
    select: { id: true }
  });
  if (perfOrders.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: perfOrders.map(o => o.id) } } });
    await prisma.order.deleteMany({ where: { clientId: { in: perfIds } } });
  }
  await prisma.client.deleteMany({ where: { id: { in: perfIds } } });
  console.log(`${perfClients.length} comptes perf_user_* supprimés`);
}

// Supprimer les comptes journey_* et perf_*
const journeyClients = await prisma.client.findMany({
  where: { 
    OR: [
      { email: { startsWith: 'journey_' } },
      { email: { startsWith: 'perf_' } },
    ]
  },
  select: { id: true, email: true }
});

if (journeyClients.length > 0) {
  const ids = journeyClients.map(c => c.id);
  const jOrders = await prisma.order.findMany({ where: { clientId: { in: ids } }, select: { id: true } });
  if (jOrders.length > 0) {
    await prisma.orderItem.deleteMany({ where: { orderId: { in: jOrders.map(o => o.id) } } });
    await prisma.order.deleteMany({ where: { clientId: { in: ids } } });
  }
  await prisma.client.deleteMany({ where: { id: { in: ids } } });
  console.log(`${journeyClients.length} comptes journey_*/perf_* supprimés`);
}

console.log('Nettoyage terminé');
await prisma.$disconnect();
