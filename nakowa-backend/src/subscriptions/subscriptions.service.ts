import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async createSubscription(clientId: string, serviceId: string, amount: number, period: string, startDate: Date, endDate: Date, monthYear?: { month: number, year: number }) {
    const id = randomUUID();

    try {
      // Utilisation d'une requête RAW pour contourner les problèmes de types du client Prisma
      await this.prisma.$executeRaw`
        INSERT INTO subscriptions (id, client_id, service_id, amount, period, start_date, end_date, is_active, created_at, updated_at)
        VALUES (${id}, ${clientId}, ${serviceId}, ${amount}, ${period}, ${startDate}, ${endDate}, true, NOW(), NOW())
      `;

      const subscription = await this.prisma.subscription.findUnique({
        where: { id },
      });

      await this.generateCollections(subscription.id, clientId, serviceId, monthYear);

      return subscription;
    } catch (error) {
      console.error('Erreur lors de la création de l\'abonnement via RAW query:', error);
      throw error;
    }
  }

  async generateCollections(subscriptionId: string, clientId: string, serviceId: string, monthYear?: { month: number, year: number }) {
    const service = await (this.prisma.service as any).findUnique({ where: { id: serviceId } });
    // Nombre de passages par semaine × 4 semaines = 8 passages par mois
    const passagesPerWeek = service?.passages || 2;
    const passages = passagesPerWeek * 4; // 8 passages total par mois
    
    // Utiliser le mois/année fourni, ou le mois/année actuel
    const now = new Date();
    const month = monthYear?.month ?? now.getMonth();
    const year = monthYear?.year ?? now.getFullYear();
    
    // Vérifier qu'on ne crée pas de doublons
    const existingCollections = await this.prisma.collection.count({
      where: {
        subscriptionId,
        scheduledAt: {
          gte: new Date(year, month, 1),
          lt: new Date(year, month + 1, 1),
        },
      },
    });

    if (existingCollections > 0) {
      console.warn(`⚠️ Les collectes existent déjà pour cette subscription (${subscriptionId})`);
      return;
    }
    
    // Créer 2 collectes par semaine pendant 4 semaines
    let passageNumber = 1;
    for (let week = 1; week <= 4; week++) {
      for (let day = 0; day < passagesPerWeek; day++) {
        const dayOfMonth = week * 7 + day;
        if (dayOfMonth <= 31) { // S'assurer qu'on ne sort pas du mois
          await this.prisma.collection.create({
            data: {
              subscriptionId,
              clientId,
              scheduledAt: new Date(year, month, dayOfMonth),
              passageNumber: passageNumber++,
            },
          });
        }
      }
    }
  }

  async prepareMonth(month?: string, year?: string) {
    console.log(`🚀 Démarrage de la préparation du mois: ${month}/${year}`);
    const now = new Date();
    let targetMonth = now.getMonth();
    let targetYear = now.getFullYear();

    if (month && year) {
      targetMonth = parseInt(month, 10) - 1;
      targetYear = parseInt(year, 10);
    }

    const startDate = new Date(targetYear, targetMonth, 1);
    const endDate = new Date(targetYear, targetMonth + 1, 0);
    console.log(`📅 Période cible: ${startDate.toDateString()} au ${endDate.toDateString()}`);

    const existingSub = await this.prisma.subscription.findFirst({
      where: {
        startDate: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (existingSub) {
      console.warn(`⚠️ Le mois est déjà préparé. Subscription ID: ${existingSub.id}`);
      throw new BadRequestException(
        `Le mois de ${startDate.toLocaleString('fr-FR', { month: 'long' })} ${targetYear} est déjà préparé. ` +
        `Supprimez d'abord les données du mois précédent avant de relancer.`
      );
    }

    // Vérification supplémentaire: s'assurer qu'aucune collection n'existe pour ce mois
    const existingCollections = await this.prisma.collection.count({
      where: {
        scheduledAt: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    if (existingCollections > 0) {
      console.warn(`⚠️ Des collectes existent déjà pour ce mois (${existingCollections} trouvées)`);
      throw new BadRequestException(
        `Des collectes existent déjà pour le mois de ${startDate.toLocaleString('fr-FR', { month: 'long' })} ${targetYear}. ` +
        `Il y a probablement ${existingCollections} doublons. Veuillez nettoyer d'abord.`
      );
    }

    const activeClients = await this.prisma.client.findMany({
      where: { isActive: true },
    });
    console.log(`👥 Clients actifs trouvés: ${activeClients.length}`);

    const results = [];
    let failureCount = 0;

    for (const client of activeClients) {
      try {
        const lastSub = await this.prisma.subscription.findFirst({
          where: { clientId: client.id },
          orderBy: { createdAt: 'desc' },
        });

        const amount = lastSub?.amount || 2000;
        const period = startDate.toLocaleString('fr-FR', { month: 'long', year: 'numeric' });

        let serviceId = (lastSub as any)?.serviceId;
        if (!serviceId) {
          const defaultService = await this.prisma.service.findFirst({ where: { isActive: true } });
          serviceId = defaultService?.id;
        }

        if (!serviceId) {
          console.error(`❌ Aucun service actif trouvé pour le client ${client.firstName} ${client.lastName} (${client.id})`);
          failureCount++;
          continue;
        }

        const sub = await this.createSubscription(client.id, serviceId, amount, period, startDate, endDate, {
          month: targetMonth,
          year: targetYear
        });
        results.push(sub);
        console.log(`✅ Abonnement créé pour ${client.firstName} ${client.lastName}`);
      } catch (clientError) {
        console.error(`❌ Erreur lors de la préparation pour le client ${client.id}:`, clientError);
        failureCount++;
      }
    }
    console.log(`🏁 Préparation terminée. Succès: ${results.length}, Échecs: ${failureCount}`);
    return {
      successCount: results.length,
      failureCount: failureCount,
      data: results
    };
  }

  async getAllSubscriptions(month?: string, year?: string) {
    const where: any = {};

    if (month && year) {
      const m = parseInt(month, 10) - 1;
      const y = parseInt(year, 10);
      const startDate = new Date(y, m, 1);
      const endDate   = new Date(y, m + 1, 0, 23, 59, 59, 999);
      where.startDate = { gte: startDate, lte: endDate };
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where,
      include: { 
        client:  true,
        service: true,
        collections: { select: { status: true, passageNumber: true } },
      },
    });

    // Enrichir avec paidAmount et paymentStatus
    const enriched = await Promise.all(subscriptions.map(async (sub) => {
      const payments = await this.prisma.payment.aggregate({
        where: {
          clientId: sub.clientId,
          period: { equals: sub.period, mode: 'insensitive' },
        },
        _sum: { amount: true },
      });

      const paidAmount = payments._sum.amount || 0;
      const remaining  = Math.max(0, sub.amount - paidAmount);

      let paymentStatus: string;
      if (paidAmount >= sub.amount)     paymentStatus = 'PAYE';
      else if (paidAmount > 0)          paymentStatus = 'PARTIEL';
      else                              paymentStatus = 'NON_PAYE';

      // Statut des collectes
      // Nombre de passages: passagesPerWeek * 4 semaines
      const passagesPerWeek = sub.service?.passages || 2;
      const totalPassages = passagesPerWeek * 4; // 8 passages par mois
      const collectedCount  = sub.collections.filter(c => c.status === 'COLLECTED').length;
      let collecteStatus: string;
      if (collectedCount >= totalPassages)    collecteStatus = 'TERMINE';
      else if (collectedCount > 0)            collecteStatus = 'EN_COURS';
      else                                    collecteStatus = 'PLANIFIE';

      return {
        ...sub,
        paidAmount,
        remaining,
        paymentStatus,
        collecteStatus,
        collectedCount,
        totalPassages,
      };
    }));

    return enriched;
  }

  async getSubscriptionById(id: string) {
    return this.prisma.subscription.findUnique({
      where: { id },
      include: { client: true, collections: true },
    });
  }

  async resetMonth(month: string, year: string) {
    const m = parseInt(month, 10) - 1;
    const y = parseInt(year, 10);
    const start = new Date(y, m, 1, 0, 0, 0, 0);
    const end = new Date(y, m + 1, 0, 23, 59, 59, 999);

    try {
      await this.prisma.$transaction(async (tx) => {
        const subscriptionsToDelete = await tx.subscription.findMany({
          where: {
            startDate: {
              gte: start,
              lte: end,
            },
          },
          select: { id: true },
        });

        const subscriptionIds = subscriptionsToDelete.map(s => s.id);

        if (subscriptionIds.length > 0) {
          await tx.collection.deleteMany({
            where: {
              subscriptionId: { in: subscriptionIds },
            },
          });
        }

        await tx.collection.deleteMany({
          where: {
            scheduledAt: {
              gte: start,
              lte: end,
            },
          },
        });

        if (subscriptionIds.length > 0) {
          await tx.subscription.deleteMany({
            where: {
              id: { in: subscriptionIds },
            },
          });
        }
      });

      return { message: `Données pour ${month}/${year} supprimées.` };
    } catch (error) {
      throw new BadRequestException(`Erreur lors de la réinitialisation : ${error.message}`);
    }
  }

  async resetTestPeriod() {
    return this.resetMonth('9', '2026');
  }
}
