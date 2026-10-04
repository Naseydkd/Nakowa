import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkCollections() {
  console.log('📊 Vérification des collectes...\n');

  // Vérifier TOUTES les subscriptions
  const allSubs = await prisma.subscription.findMany({
    include: {
      client: true,
      collections: true,
      service: true
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  if (allSubs.length === 0) {
    console.log('❌ Aucune subscription trouvée du tout');
    await prisma.$disconnect();
    return;
  }

  console.log(`✅ ${allSubs.length} subscriptions trouvées (dernières)\n`);

  for (const sub of allSubs) {
    console.log(`\n👤 ${sub.client.firstName} ${sub.client.lastName}`);
    console.log(`   Service: ${sub.service.nom} (${sub.service.passages} passages configurés)`);
    console.log(`   Période: ${sub.period}`);
    console.log(`   Collectes trouvées: ${sub.collections.length}`);
    
    for (const col of sub.collections.sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime())) {
      console.log(`     - Passage ${col.passageNumber}: ${col.scheduledAt.toLocaleDateString('fr-FR')} (${col.status})`);
    }
  }

  // Statistiques globales
  console.log('\n📈 Statistiques globales:');
  let totalCollections = 0;
  for (const sub of allSubs) {
    totalCollections += sub.collections.length;
  }
  console.log(`   Total subscriptions affichées: ${allSubs.length}`);
  console.log(`   Total collections: ${totalCollections}`);
  console.log(`   Moyenne par subscription: ${(totalCollections / allSubs.length).toFixed(1)}`);

  await prisma.$disconnect();
}

checkCollections().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
