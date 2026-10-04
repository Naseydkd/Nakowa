import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetSubscriptions() {
  console.log('🗑️  Suppression de toutes les subscriptions et collectes...');

  // Supprimer d'abord les collectes
  const deletedCollections = await prisma.collection.deleteMany({});
  console.log(`   ✅ ${deletedCollections.count} collectes supprimées`);

  // Puis les subscriptions
  const deletedSubscriptions = await prisma.subscription.deleteMany({});
  console.log(`   ✅ ${deletedSubscriptions.count} subscriptions supprimées`);

  console.log('\n✨ Nettoyage terminé. Les données sont prêtes pour une nouvelle génération.');
  await prisma.$disconnect();
}

resetSubscriptions().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
