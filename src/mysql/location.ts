import { PrismaClient } from '@prisma/client';
import { Location } from '../../lib/domains/location';
import { LocationRepository } from '../../lib/repositories/location_repository';

export class LocationMysql implements LocationRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async readById(id: string): Promise<Location> {
    try {
      const prismaLocationObject = await this.prisma.location.findUnique({
        where: {
          id: id,
        },
      });
      if (prismaLocationObject === null) {
        throw new Error('object not found: ' + id);
      }
      return new Location(
        prismaLocationObject.id,
        prismaLocationObject.address,
      );
    } catch (error) {
      console.log(error);
    }
  }

  async readAll(): Promise<Location[]> {
    try {
      const prismaLocationObjects = await this.prisma.location.findMany();
      const locations: Location[] = [];
      for (let i = 0; i < prismaLocationObjects.length; i++) {
        locations.push(
          new Location(
            prismaLocationObjects[i].id,
            prismaLocationObjects[i].address,
          ),
        );
      }
      return locations;
    } catch (error) {
      console.log(error);
    }
  }
}
