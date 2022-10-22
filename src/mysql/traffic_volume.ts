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

  async readTrafficVolumeByModel(carId: string): Promise<number> {
    const count = await this.prisma.trafficVolume.aggregate({
      where: {
        carId: carId,
      },
      _count: {
        carId: true,
      },
    });
    return count._count.carId;
  }

  async readTrafficVolumeByTime(hour: number): Promise<number> {
    if (hour < 0 || hour < 24) {
      throw new Error('invalid hour format: need 0 ~ 23');
    }
    const count = this.prisma.trafficVolume.aggregate({
      // where: {
      //   time: {
      //   }
      // },
    });
    throw new Error('Method not implemented.');
  }
}
