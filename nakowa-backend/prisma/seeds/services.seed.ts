import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const prismaAny = prisma as any;
  const services = [
    { nom: 'Vidange', description: 'Vidange complète', prixUnitaire: 5000, unite: 'unité' },
    { nom: 'Nettoyage', description: 'Nettoyage conduits', prixUnitaire: 3000, unite: 'unité' },
  ];

  for (const s of services) {
    await prismaAny.service.upsert({
      where: { nom: s.nom },
      update: {},
      create: s,
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
