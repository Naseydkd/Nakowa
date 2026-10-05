const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function syncDefaultAmounts() {
  console.log('🔍 Analyse des montants de paiement pour chaque client...\n');

  try {
    // Récupérer tous les clients
    const clients = await prisma.client.findMany({
      where: { isActive: true },
    });

    console.log(`📊 Clients actifs trouvés: ${clients.length}\n`);

    let updatedCount = 0;
    let results = [];

    // Pour chaque client, trouver le montant de paiement le plus courant
    for (const client of clients) {
      const payments = await prisma.payment.findMany({
        where: { clientId: client.id },
        select: { amount: true },
      });

      if (payments.length === 0) {
        console.log(`⚠️  ${client.firstName} ${client.lastName} - Aucun paiement trouvé`);
        continue;
      }

      // Trouver le montant le plus courant
      const amountCounts = {};
      payments.forEach(p => {
        amountCounts[p.amount] = (amountCounts[p.amount] || 0) + 1;
      });

      const mostCommonAmount = Object.keys(amountCounts).reduce((a, b) =>
        amountCounts[a] > amountCounts[b] ? a : b
      );

      const newDefaultAmount = parseFloat(mostCommonAmount);

      // Vérifier si différent de l'actuel
      if (client.defaultAmount !== newDefaultAmount) {
        await prisma.client.update({
          where: { id: client.id },
          data: { defaultAmount: newDefaultAmount },
        });

        updatedCount++;
        results.push({
          nom: `${client.firstName} ${client.lastName}`,
          ancien: client.defaultAmount,
          nouveau: newDefaultAmount,
          nbPaiements: payments.length,
        });

        console.log(`✅ ${client.firstName} ${client.lastName}: ${client.defaultAmount} → ${newDefaultAmount} XOF (${payments.length} paiements)`);
      } else {
        console.log(`✓  ${client.firstName} ${client.lastName}: ${newDefaultAmount} XOF (déjà correct)`);
      }
    }

    console.log(`\n🏁 Résumé:`);
    console.log(`   Clients mis à jour: ${updatedCount}`);
    console.log(`   Clients inchangés: ${clients.length - updatedCount}\n`);

    if (results.length > 0) {
      console.log('📋 Changements effectués:');
      results.forEach(r => {
        console.log(`   ${r.nom}: ${r.ancien} → ${r.nouveau} XOF`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

syncDefaultAmounts();
