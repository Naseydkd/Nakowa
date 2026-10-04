import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CollectionStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionQueryDto } from './dto/collection.dto';

@Injectable()
export class CollectionsService {
  constructor(private prisma: PrismaService) {}

  async getCollections(filters: any) {
    try {
      const page = parseInt(filters.page, 10) || 1;
      const limit = parseInt(filters.limit, 10) || 100; // Augmenté à 100 pour avoir toutes les collections
      const skip = (page - 1) * limit;

      const where: Prisma.CollectionWhereInput = {};

      // Construire le filtre de recherche et zone
      const clientFilters: any = {};
      
      if (filters.search) {
        // Recherche dans le nom ou téléphone du client, ou dans l'adresse
        clientFilters.OR = [
          { firstName: { contains: filters.search, mode: 'insensitive' } },
          { lastName: { contains: filters.search, mode: 'insensitive' } },
          { phone: { contains: filters.search } },
          { address: { contains: filters.search, mode: 'insensitive' } }
        ];
      }

      if (filters.zone) {
        // Ajouter le filtre de zone/adresse
        if (clientFilters.OR) {
          // Si une recherche est déjà appliquée, combiner les filtres
          clientFilters.AND = [
            { OR: clientFilters.OR },
            { address: { equals: filters.zone, mode: 'insensitive' } }
          ];
          delete clientFilters.OR;
        } else {
          clientFilters.address = { equals: filters.zone, mode: 'insensitive' };
        }
      }

      // Appliquer les filtres client s'il y en a
      if (Object.keys(clientFilters).length > 0) {
        where.client = clientFilters;
      }

      if (filters.date) {
        try {
          const date = new Date(filters.date);
          if (!isNaN(date.getTime())) {
            const start = new Date(date);
            start.setHours(0, 0, 0, 0);
            const end = new Date(date);
            end.setHours(23, 59, 59, 999);
            where.scheduledAt = { gte: start, lte: end };
          }
        } catch (e) {
          console.error('Invalid date filter:', filters.date);
        }
      }

      // Filtre par mois et année
      if (filters.month && filters.year) {
        const month = parseInt(filters.month, 10) - 1; // 0-indexed
        const year = parseInt(filters.year, 10);
        const startOfMonth = new Date(year, month, 1);
        startOfMonth.setHours(0, 0, 0, 0);
        const endOfMonth = new Date(year, month + 1, 0);
        endOfMonth.setHours(23, 59, 59, 999);
        where.scheduledAt = { gte: startOfMonth, lte: endOfMonth };
      }

      if (filters.agent) {
        where.agentId = filters.agent;
      }

      if (filters.status) {
        where.status = filters.status as CollectionStatus;
      }

      if (filters.passage) {
        where.passageNumber = parseInt(filters.passage, 10);
      }

      // Fetch all matching collections to apply custom sorting
      const allCollections = await this.prisma.collection.findMany({
        where,
        include: {
          client: true,
          agent: true,
          subscription: true,
        },
        orderBy: { scheduledAt: 'asc' },
      });

      // Custom Sort: SCHEDULED -> PROBLEM -> COLLECTED
      const statusPriority = {
        [CollectionStatus.SCHEDULED]: 0,
        [CollectionStatus.COLLECTED]: 2,
      };

      const sorted = allCollections.sort((a, b) => {
        const priorityA = statusPriority[a.status] ?? 1;
        const priorityB = statusPriority[b.status] ?? 1;
        return priorityA - priorityB;
      });

      const data = sorted.slice(skip, skip + limit);
      const total = sorted.length;

      const stats = await this.calculateStats(where);

      return {
        data,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        stats,
      };
    } catch (error) {
      console.error('Critical error in getCollections:', error);
      throw new InternalServerErrorException('Une erreur interne est survenue lors de la récupération des collectes');
    }
  }

  async getCollection(id: string) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: {
        client: true,
        agent: true,
        subscription: true,
      },
    });

    if (!collection) {
      throw new NotFoundException(`Collection with ID ${id} not found`);
    }

    return collection;
  }

  async calculateStats(where: Prisma.CollectionWhereInput) {
    try {
      // Récupérer toutes les collections avec leur subscription et service
      const all = await this.prisma.collection.findMany({
        where,
        select: { 
          status: true,
          subscriptionId: true,
          subscription: {
            select: {
              service: {
                select: {
                  passages: true
                }
              }
            }
          }
        },
      });

      // Grouper par subscription pour calculer les tâches complètes
      const groupedBySubscription = new Map();
      
      all.forEach(collection => {
        const subId = collection.subscriptionId;
        if (!groupedBySubscription.has(subId)) {
          groupedBySubscription.set(subId, {
            totalPassages: collection.subscription?.service?.passages || 2,
            collections: []
          });
        }
        groupedBySubscription.get(subId).collections.push(collection);
      });

      // Calculer les tâches complètes (tous les passages COLLECTED)
      let completedTasks = 0;
      let remainingTasks = 0;
      const totalTasks = groupedBySubscription.size;

      groupedBySubscription.forEach((group) => {
        const collectedCount = group.collections.filter(c => c.status === CollectionStatus.COLLECTED).length;
        const hasProblems = group.collections.some(c => 
          c.status !== CollectionStatus.SCHEDULED && c.status !== CollectionStatus.COLLECTED
        );
        
        // Une tâche est complète si tous ses passages sont COLLECTED
        if (collectedCount === group.totalPassages) {
          completedTasks++;
        } else {
          remainingTasks++;
        }
      });

      return {
        scheduled: totalTasks, // Nombre total de tâches (subscriptions)
        completed: completedTasks, // Tâches avec tous les passages terminés
        remaining: remainingTasks, // Tâches avec au moins un passage restant
        problems: 0, // On ne compte plus les problèmes séparément
      };
    } catch (error) {
      console.error('Error calculating stats:', error);
      return { scheduled: 0, completed: 0, remaining: 0, problems: 0 };
    }
  }

  async markAsCollected(id: string, agentId: string, location?: { lat: number, lng: number }) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
      include: { 
        subscription: {
          include: {
            service: true
          }
        }
      }
    });

    if (!collection) throw new NotFoundException('Collection non trouvée');

    // On ne peut pas re-collecter ce qui est déjà COLLECTED
    if (collection.status === CollectionStatus.COLLECTED) {
      throw new NotFoundException('Ce passage est déjà collecté.');
    }

    // Marquer le passage actuel comme collecté
    await this.prisma.collection.update({
      where: { id },
      data: {
        status: CollectionStatus.COLLECTED,
        completedAt: new Date(),
        agentId,
        latitude: location?.lat,
        longitude: location?.lng,
      },
    });

    // Vérifier s'il y a un prochain passage à activer
    const totalPassages = collection.subscription?.service?.passages || 2;
    const currentPassage = collection.passageNumber;

    if (currentPassage < totalPassages) {
      // Chercher le prochain passage
      const nextPassage = await this.prisma.collection.findFirst({
        where: {
          subscriptionId: collection.subscriptionId,
          passageNumber: currentPassage + 1,
        },
      });

      // Si le prochain passage existe et n'est pas encore collecté, on le garde SCHEDULED
      // Sinon il n'y a rien à faire, il est déjà prêt
      if (nextPassage && nextPassage.status !== CollectionStatus.COLLECTED) {
        // Le prochain passage est déjà SCHEDULED, pas besoin de le modifier
      }
    }

    return { 
      message: 'Passage validé avec succès',
      isComplete: currentPassage >= totalPassages
    };
  }

  async reportProblem(id: string, agentId: string, status: CollectionStatus, description?: string) {
    if (status === CollectionStatus.SCHEDULED || status === CollectionStatus.COLLECTED) {
      throw new NotFoundException('Le statut doit décrire un problème de collecte.');
    }
    return this.prisma.collection.update({
      where: { id },
      data: {
        status,
        problemReason: description,
        agentId,
        completedAt: new Date(),
      },
    });
  }
}
