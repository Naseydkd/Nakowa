import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CollectionStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) {}

    async getStats(month?: string, year?: string) {
        // Récupérer toutes les collections (globales, sans filtre par mois)
        const allCollections = await this.prisma.collection.findMany({
            select: {
                status: true,
                subscriptionId: true,
                subscription: {
                    select: {
                        service: { select: { passages: true } }
                    }
                }
            }
        });

        // Grouper par subscription pour compter les tâches (une tâche = un client)
        const groupedBySubscription = new Map<string, { totalPassages: number, collectedCount: number, hasAny: boolean }>();
        allCollections.forEach(c => {
            if (!groupedBySubscription.has(c.subscriptionId)) {
                groupedBySubscription.set(c.subscriptionId, {
                    totalPassages: c.subscription?.service?.passages || 2,
                    collectedCount: 0,
                    hasAny: true
                });
            }
            if (c.status === CollectionStatus.COLLECTED) {
                groupedBySubscription.get(c.subscriptionId).collectedCount++;
            }
        });

        // Calculer les tâches : planned, completed, pending
        const totalTasks = groupedBySubscription.size; // Nb total de clients
        let completedTasks = 0;
        let pendingTasks = 0;

        groupedBySubscription.forEach(group => {
            if (group.collectedCount >= group.totalPassages) {
                completedTasks++; // Tous les passages collectés
            } else {
                pendingTasks++; // Au moins un passage restant
            }
        });

        // Clients
        const [totalClients, activeClients] = await Promise.all([
            this.prisma.client.count(),
            this.prisma.client.count({ where: { isActive: true } }),
        ]);

        // Finances : données globales (toutes les subscriptions et paiements)
        const allSubscriptions = await this.prisma.subscription.findMany({
            where: {
                isActive: true
            },
            select: {
                amount: true
            }
        });

        // Calculer le montant total attendu : somme de tous les abonnements
        const totalExpected = allSubscriptions.reduce((sum, sub) => sum + sub.amount, 0);

        // Montant effectivement payé (global)
        const paymentsTotal = await this.prisma.payment.aggregate({
            _sum: { amount: true }
        });
        const totalPaid = paymentsTotal._sum.amount || 0;

        return {
            clients: {
                total: totalClients,
                active: activeClients,
                inactive: totalClients - activeClients
            },
            finance: {
                total: totalExpected,       // Montant total attendu des abonnements
                paid: totalPaid,            // Montant réellement payé
                remaining: Math.max(0, totalExpected - totalPaid) // Reste à payer
            },
            interventions: {
                planned: totalTasks,        // Nb de clients à visiter (tâches)
                completed: completedTasks,  // Tâches entièrement terminées (tous passages)
                pending: pendingTasks       // Tâches avec au moins un passage restant
            }
        };
    }
}
