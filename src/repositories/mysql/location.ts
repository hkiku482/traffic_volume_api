import { PrismaClient } from '@prisma/client';
import { Location } from '../../domains/location';
import { LocationRepository } from '../location_repository';

export class LocationMysql implements LocationRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async readById(id: string): Promise<Location> {
    const prismaLocationObject = await this.prisma.location.findUnique({
      where: {
        id: id,
      },
    });
    if (prismaLocationObject === null) {
      throw new Error('object not found: ' + id);
    }
    return new Location(prismaLocationObject.id, prismaLocationObject.address);
  }
}
