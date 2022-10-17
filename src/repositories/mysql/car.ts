import { PrismaClient } from '@prisma/client';
import { Car } from '../../domains/car';
import { CarRepository } from '../car_repository';

export class CarMysql implements CarRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async readById(id: string): Promise<Car> {
    const prismaCarObject = await this.prisma.car.findUnique({
      where: {
        id: id,
      },
    });
    if (prismaCarObject === null) {
      throw new Error('object not found: ' + id);
    }
    return new Car(prismaCarObject.id, prismaCarObject.model);
  }

  async readByModel(model: string): Promise<Car> {
    const prismaCarObject = await this.prisma.car.findFirst({
      where: {
        model: model,
      },
    });
    if (prismaCarObject === null) {
      throw new Error('object not found: ' + model);
    }
    return new Car(prismaCarObject.id, prismaCarObject.model);
  }
}
