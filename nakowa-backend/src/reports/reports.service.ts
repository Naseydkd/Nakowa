import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ReportData } from '../email/email.service';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(private prisma: PrismaService) {}

  async generateReport(): Promise<ReportData> {
    try {
      // Collectes en attente (SCHEDULED)
      const collectesEnAttente = await this.prisma.collection.count({
        where: { status: 'SCHEDULED' },
      });

      // Collectes en cours (non-SCHEDULED and not yet completed)
      const collectesEnCours = await this.prisma.collection.count({
        where: {
          NOT: { status: 'SCHEDULED' },
          completedAt: null,
        },
      });

      // Collectes restantes (SCHEDULED)
      const collectesRestantes = collectesEnAttente;

      // Total active subscriptions
      const totalAbonnements = await this.prisma.subscription.count({
        where: { isActive: true },
      });

      // Total amount collected (sum of all payments)
      const paymentResult = await this.prisma.payment.aggregate({
        _sum: { amount: true },
      });
      const montantEncaisse = paymentResult._sum.amount || 0;

      // Total amount to be collected (sum of all active subscriptions)
      const subscriptionResult = await this.prisma.subscription.aggregate({
        where: { isActive: true },
        _sum: { amount: true },
      });
      const totalAbonnementAmount = subscriptionResult._sum.amount || 0;

      // Remaining to collect
      const resteEncaisser = totalAbonnementAmount - montantEncaisse;

      this.logger.log('Report generated successfully');

      return {
        collectesEnAttente,
        collectesEnCours,
        collectesRestantes,
        totalAbonnements,
        montantEncaisse,
        resteEncaisser,
        generatedAt: new Date(),
      };
    } catch (error) {
      this.logger.error('Failed to generate report', error.stack);
      throw error;
    }
  }
}
