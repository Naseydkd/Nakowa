import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentMethod } from '@prisma/client';

@Injectable()
export class PaymentsService {
    constructor(private prisma: PrismaService) {}

    async findAll(filters: any = {}) {
        const { month, year, clientId, method, page = 1, limit = 50 } = filters;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where: any = {};

        if (clientId) where.clientId = clientId;
        if (method)   where.method   = method;

        if (month && year) {
            const m = parseInt(month) - 1;
            const y = parseInt(year);
            where.paymentDate = {
                gte: new Date(y, m, 1),
                lte: new Date(y, m + 1, 0, 23, 59, 59, 999),
            };
        }

        const [payments, total] = await Promise.all([
            this.prisma.payment.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { paymentDate: 'desc' },
                include: { client: true, creator: { select: { id: true, name: true } } },
            }),
            this.prisma.payment.count({ where }),
        ]);

        return {
            data: payments,
            pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
        };
    }

    async findByClient(clientId: string) {
        const payments = await this.prisma.payment.findMany({
            where: { clientId },
            orderBy: { paymentDate: 'desc' },
            include: { creator: { select: { id: true, name: true } } },
        });
        return { data: payments };
    }

    async findOne(id: string) {
        const payment = await this.prisma.payment.findUnique({
            where: { id },
            include: { client: true, creator: { select: { id: true, name: true } } },
        });
        if (!payment) throw new NotFoundException('Paiement non trouvé');
        return payment;
    }

    async create(data: any, createdBy: string) {
        // Vérifier que le client existe
        const client = await this.prisma.client.findUnique({ where: { id: data.clientId } });
        if (!client) throw new NotFoundException('Client non trouvé');

        const payment = await this.prisma.payment.create({
            data: {
                clientId:    data.clientId,
                amount:      parseFloat(data.amount),
                period:      data.period || null,
                paymentDate: data.paymentDate ? new Date(data.paymentDate) : new Date(),
                method:      data.method as PaymentMethod,
                reference:   data.reference || null,
                notes:        data.notes || null,
                createdBy,
            },
            include: { client: true, creator: { select: { id: true, name: true } } },
        });

        return payment;
    }

    async delete(id: string) {
        await this.findOne(id); // Vérifie existence
        return this.prisma.payment.delete({ where: { id } });
    }
}
