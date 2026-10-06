import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ClientFilterDto, ClientStatus } from './dto/client-filter.dto';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';

@Injectable()
export class ClientsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: ClientFilterDto & { month?: string, year?: string }) {
    const { page = 1, pageSize = 20, status, address, hasLocation, hasPhone, hasEmail, search, month, year } = filters;
    // Convertir pageSize en nombre car il peut arriver comme string depuis les query params
    const pageSizeNum = typeof pageSize === 'string' ? parseInt(pageSize, 10) : pageSize;
    const pageNum = typeof page === 'string' ? parseInt(page, 10) : page;
    const skip = (pageNum - 1) * pageSizeNum;
    const where: Prisma.ClientWhereInput = {
      ...(status === ClientStatus.ACTIVE && { isActive: true }),
      ...(status === ClientStatus.INACTIVE && { isActive: false }),
      ...(address && { address: { equals: address, mode: 'insensitive' } }),
      ...(hasPhone && { phone: { not: null } }),
      ...(hasEmail && { email: { not: null } }),
      ...(hasLocation && { latitude: { not: null }, longitude: { not: null } }),
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [clients, total] = await Promise.all([
      this.prisma.client.findMany({
        where,
        skip,
        take: pageSizeNum,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.client.count({ where }),
    ]);

    // Déterminer le mois/année à utiliser pour les finances
    const now = new Date();
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
    const targetYear  = year  ? parseInt(year, 10)      : now.getFullYear();
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth   = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59, 999);

    // Construire le label "periode" pour filtrer par mois exact
    const periodLabel = startOfMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }).toLowerCase();

    // Optimisation: Récupérer TOUS les abonnements et paiements en 2 requêtes au lieu de N requêtes
    const clientIds = clients.map(c => c.id);
    
    const [allSubscriptions, allPayments] = await Promise.all([
      this.prisma.subscription.findMany({
        where: { clientId: { in: clientIds }, isActive: true },
        select: { clientId: true, amount: true, period: true },
      }),
      this.prisma.payment.findMany({
        where: { clientId: { in: clientIds } },
        select: { clientId: true, amount: true, period: true },
      }),
    ]);

    // Grouper par clientId
    const subscriptionsByClient: Record<string, typeof allSubscriptions> = {};
    const paymentsByClient: Record<string, typeof allPayments> = {};

    allSubscriptions.forEach(sub => {
      if (!subscriptionsByClient[sub.clientId]) subscriptionsByClient[sub.clientId] = [];
      subscriptionsByClient[sub.clientId].push(sub);
    });

    allPayments.forEach(pay => {
      if (!paymentsByClient[pay.clientId]) paymentsByClient[pay.clientId] = [];
      paymentsByClient[pay.clientId].push(pay);
    });

    // Calculer le restant pour chaque client
    const data = clients.map((client) => {
      const clientSubs = subscriptionsByClient[client.id] || [];
      const clientPays = paymentsByClient[client.id] || [];

      // Calculer le restant par period puis sommer
      const paidByPeriod: Record<string, number> = {};
      clientPays.forEach(p => {
        const key = (p.period || '').toLowerCase();
        paidByPeriod[key] = (paidByPeriod[key] || 0) + p.amount;
      });

      let totalDebt = 0; // Restant total de tous les mois impayés
      clientSubs.forEach(sub => {
        const key = (sub.period || '').toLowerCase();
        const paid = paidByPeriod[key] || 0;
        const remaining = Math.max(0, sub.amount - paid);
        totalDebt += remaining;
      });

      return {
        ...client,
        totalDebt, // Total restant à payer sur tous les mois
      };
    });

    return {
      data,
      pagination: { total, page, pageSize, totalPages: Math.ceil(total / pageSize) },
    };
  }

  async findOne(id: string) {
    return this.prisma.client.findUnique({
      where: { id },
      include: { 
        payments: true, 
        subscriptions: { 
          include: { collections: true } 
        },
      },
    });
  }

  async create(data: CreateClientDto) {
    return this.prisma.client.create({ data });
  }

  async update(id: string, data: UpdateClientDto) {
    return this.prisma.client.update({ where: { id }, data });
  }

  async updateDefaultAmount(id: string, defaultAmount: number) {
    return this.prisma.client.update({
      where: { id },
      data: { defaultAmount },
    });
  }

  async deactivate(id: string) {
    return this.prisma.client.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getClientCollections(id: string) {
    const collections = await this.prisma.collection.findMany({
      where: { clientId: id },
      include: {
        subscription: {
          include: { service: true }
        },
        agent: {
          select: { name: true }
        }
      },
      orderBy: { scheduledAt: 'desc' },
    });
    return collections;
  }

  async getClientsForMap() {
    const clients = await this.prisma.client.findMany({
      where: {
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        latitude: true,
        longitude: true,
        address: true,
        subscriptions: {
          where: { isActive: true },
          select: {
            amount: true,
            period: true,
          },
        },
        payments: {
          select: {
            amount: true,
            period: true,
          },
        },
      },
    });

    // Calculer le statut de paiement pour chaque client
    return clients.map(client => {
      // Calculer le restant total de tous les mois
      const paidByPeriod: Record<string, number> = {};
      client.payments.forEach(p => {
        const key = (p.period || '').toLowerCase();
        paidByPeriod[key] = (paidByPeriod[key] || 0) + p.amount;
      });

      let totalDebt = 0;
      let totalExpected = 0;
      let totalPaid = 0;

      client.subscriptions.forEach(sub => {
        totalExpected += sub.amount;
        const key = (sub.period || '').toLowerCase();
        const paid = paidByPeriod[key] || 0;
        const remaining = Math.max(0, sub.amount - paid);
        totalDebt += remaining;
        totalPaid += Math.min(paid, sub.amount);
      });

      // Déterminer le statut de paiement
      let paymentStatus = 'PAYE'; // Défaut
      if (totalDebt > 0) {
        if (totalPaid === 0) {
          paymentStatus = 'NON_PAYE';
        } else {
          paymentStatus = 'PARTIEL';
        }
      }

      return {
        id: client.id,
        firstName: client.firstName,
        lastName: client.lastName,
        latitude: client.latitude,
        longitude: client.longitude,
        address: client.address,
        paymentStatus,
        totalDebt,
        totalExpected,
        totalPaid,
      };
    });
  }

  async importClients(clientsData: Array<{ name: string; phone: string; activity?: string; number?: string; defaultAmount?: number; address?: string }>) {
    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const clientData of clientsData) {
      try {
        // Parser le nom en firstName et lastName
        const nameParts = (clientData.name || '').trim().split(' ');
        const firstName = nameParts[0] || 'N/A';
        const lastName = nameParts.slice(1).join(' ') || '';

        // Créer le client
        await this.prisma.client.create({
          data: {
            firstName,
            lastName,
            phone: clientData.phone || '',
            address: clientData.address || '',
            activity: clientData.activity || null,
            number: clientData.number || null,
            defaultAmount: clientData.defaultAmount || 2000,
            isActive: true,
          },
        });

        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          name: clientData.name,
          error: error.message,
        });
      }
    }

    return results;
  }
}
