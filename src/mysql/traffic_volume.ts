import { PrismaClient } from '@prisma/client';
import { Car } from '../lib/domains/car';
import { Location } from '../lib/domains/location';
import { TrafficVolume } from '../lib/domains/traffic_volume';
import { TrafficVolumeRepository } from '../lib/repositories/traffic_volume_repository';

export class TrafficVolumeMysql implements TrafficVolumeRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async create(trafficVolume: TrafficVolume): Promise<void> {
    await this.prisma.trafficVolume.create({
      data: {
        id: trafficVolume.id,
        imageId: trafficVolume.imageId,
        locationId: trafficVolume.location.id,
        carId: trafficVolume.car.id,
        time: trafficVolume.time,
      },
    });
    return;
  }

  async readById(id: string): Promise<TrafficVolume> {
    const prismaObject = await this.prisma.trafficVolume.findUnique({
      where: {
        id: id,
      },
      include: {
        car: {},
        location: {},
      },
    });
    if (prismaObject === null) {
      throw new Error('object not found: ' + id);
    }
    const car = new Car(prismaObject.car.id, prismaObject.car.model);
    const location = new Location(
      prismaObject.location.id,
      prismaObject.location.address,
    );
    return new TrafficVolume(
      prismaObject.id,
      prismaObject.imageId,
      location,
      car,
      prismaObject.time,
    );
  }

  async readTrafficVolumeByModel(
    carId: string,
    locationId = '',
  ): Promise<number> {
    const count =
      locationId === ''
        ? // location id is empty
          await this.prisma.trafficVolume.aggregate({
            where: {
              carId: carId,
            },
            _count: {
              carId: true,
            },
          })
        : // location id specified
          await this.prisma.trafficVolume.aggregate({
            where: {
              carId: carId,
              locationId: locationId,
            },
            _count: {
              carId: true,
            },
          });
    return count._count.carId;
  }

  async readTrafficVolumeByTime(
    hour: number,
    locationId = '',
  ): Promise<number> {
    if (hour < 0 || hour < 24) {
      throw new Error('invalid hour format: need 0 ~ 23');
    }
    const prismaObject =
      locationId === ''
        ? // location id is empty
          await this.prisma.trafficVolume.findMany({})
        : // location id specified
          await this.prisma.trafficVolume.findMany({
            where: {
              locationId: locationId,
            },
          });

    let count = 0;

    for (let i = 0; i < prismaObject.length; i++) {
      if (prismaObject[i].time.getHours() === hour) {
        count++;
      }
    }
    return count;
  }
}
