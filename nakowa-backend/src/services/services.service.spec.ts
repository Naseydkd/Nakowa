import { ServiceType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ServicesService } from './services.service';

describe('ServicesService', () => {
  const create = jest.fn();
  const prisma = { service: { create } } as unknown as PrismaService;
  const service = new ServicesService(prisma);

  beforeEach(() => jest.clearAllMocks());

  it('creates a catalogue service using the validated Prisma model', async () => {
    const data = {
      nom: 'Vidange',
      type: ServiceType.VIDANGE,
      prixUnitaire: 5000,
      unite: 'unité',
    };
    create.mockResolvedValue({ id: 'service-1', ...data });

    await expect(service.create(data)).resolves.toMatchObject({ id: 'service-1', nom: 'Vidange' });
    expect(create).toHaveBeenCalledWith({ data });
  });
});
