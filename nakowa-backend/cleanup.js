const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const start = new Date('2026-09-01T00:00:00Z');
  const end = new Date('2026-10-31T23:59:59Z');

  console.log('Nettoyage des données de septembre et octobre...');

  try {
    // 1. Supprimer les collectes
    const collectionsDeleted = await prisma.collection.deleteMany({
      where: {
        scheduledAt: {
          gte: start,
          lte: end,
        },
      },
    });
    console.log(`Collectes supprimées : ${collectionsDeleted.count}`);

    // 2. Supprimer les abonnements
    const subscriptionsDeleted = await prisma.subscription.deleteMany({
      where: {
        startDate: {
          gte: start,
          lte: end,
        },
      },
    });
    console.log(`Abonnements supprimés : ${subscriptionsDeleted.count}`);

    console.log('Nettoyage terminé avec succès.');
  } catch (e) {
    console.error('Erreur pendant le nettoyage:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
