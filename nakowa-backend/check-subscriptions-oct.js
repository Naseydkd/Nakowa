import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  console.log('📊 Vérification des subscriptions pour octobre 2026...\n');

  // Subscriptions pour octobre 2026
  const startDate = new Date(2026, 9, 1); // octobre (0-indexed, donc 9)
  const endDate = new Date(2026, 10, 0, 23, 59, 59, 999);

  const octoberSubs = await prisma.subscription.findMany({
    where: {
      startDate: { gte: startDate, lte: endDate }
    },
    include: { client: true }
  });

  console.log(`✅ Subscriptions en octobre 2026: ${octoberSubs.length}\n`);

  // Total subscriptions
  const total = await prisma.subscription.count();
  console.log(`📊 Total subscriptions (tous les mois): ${total}`);

  // Par mois
  console.log('\n📈 Distribution par mois:');
  for (let month = 0; month < 12; month++) {
    const start = new Date(2026, month, 1);
    const end = new Date(2026, month + 1, 0, 23, 59, 59, 999);
    const count = await prisma.subscription.count({
      where: { startDate: { gte: start, lte: end } }
    });
    if (count > 0) {
      const monthLabel = start.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });
      console.log(`   ${monthLabel}: ${count} subscriptions`);
    }
  }

  await prisma.$disconnect();
}

check().catch(err => {
  console.error('❌ Erreur:', err);
  process.exit(1);
});
