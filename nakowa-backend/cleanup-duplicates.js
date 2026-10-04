import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanupDuplicateCollections() {
  console.log('🧹 Nettoyage des collectes en doublon...');

  // Récupérer toutes les subscriptions avec leurs collectes
  const subscriptions = await prisma.subscription.findMany({
    include: {
      collections: {
        orderBy: { scheduledAt: 'asc' }
      }
    }
  });

  let deletedCount = 0;

  for (const sub of subscriptions) {
    if (sub.collections.length === 0) continue;

    // Grouper par passage et mois
    const passageMap = new Map();

    for (const collection of sub.collections) {
      const key = `${collection.passageNumber}-${collection.scheduledAt.getFullYear()}-${collection.scheduledAt.getMonth()}`;
      
      if (!passageMap.has(key)) {
        passageMap.set(key, []);
      }
      passageMap.get(key).push(collection);
    }

    // Supprimer les doublons (garder le premier, supprimer les autres)
    for (const [key, collections] of passageMap.entries()) {
      if (collections.length > 1) {
        console.log(`  ⚠️  ${collections.length} doublons trouvés pour le passage ${key}`);
        
        // Garder la première, supprimer les autres
        const toDelete = collections.slice(1);
        for (const col of toDelete) {
          await prisma.collection.delete({
            where: { id: col.id }
          });
          deletedCount++;
        }
      }
    }
  }

  console.log(`✅ ${deletedCount} collectes en doublon supprimées`);
  await prisma.$disconnect();
}

cleanupDuplicateCollections().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
