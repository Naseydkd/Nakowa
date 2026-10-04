import { PrismaClient, UserRole, ServiceType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // 1. Nettoyage des données existantes
    await prisma.activityLog.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.collection.deleteMany();
    await prisma.subscription.deleteMany();
    await prisma.service.deleteMany();
    await prisma.client.deleteMany();
    await prisma.user.deleteMany();

    // 2. Création des Utilisateurs (Admin seulement)
    const passwordHash = await bcrypt.hash('password123', 12);

    const admin = await prisma.user.create({
        data: {
            name: 'Abdoul Nasser Seydou',
            email: 'admin@nakowa.com',
            passwordHash,
            role: UserRole.ADMIN,
        }
    });

    console.log('✅ Admin créé');

    // 3. Création des Services
    const servicesData = [
        { nom: 'Vidange complète', type: ServiceType.VIDANGE, prixUnitaire: 15000, unite: 'm3', passages: 2 },
        { nom: 'Nettoyage fosse', type: ServiceType.NETTOYAGE, prixUnitaire: 10000, unite: 'forfait', passages: 2 },
        { nom: 'Assainissement', type: ServiceType.ASSAINISSEMENT, prixUnitaire: 20000, unite: 'forfait', passages: 2 },
        { nom: 'Curage caniveau', type: ServiceType.CURAGE, prixUnitaire: 12000, unite: 'mètre', passages: 2 },
    ];
    const services = [];
    for (const s of servicesData) {
        const service = await prisma.service.create({ data: s });
        services.push(service);
    }
    console.log('✅ Services créés');

    console.log('🚀 Seeding terminé avec succès !');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
