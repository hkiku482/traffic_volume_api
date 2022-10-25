import { PrismaClient } from '@prisma/client';
import { Car } from '../../lib/domains/car';
import { CarRepository } from '../../lib/repositories/car_repository';

export class CarMysql implements CarRepository {
  private readonly prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async readById(id: string): Promise<Car> {
    try {
      const prismaCarObject = await this.prisma.car.findUnique({
        where: {
          id: id,
        },
      });
      if (prismaCarObject === null) {
        throw new Error('object not found: ' + id);
      }
      return new Car(prismaCarObject.id, prismaCarObject.model);
    } catch (error) {
      console.log(error);
    }
  }

  async readByModel(model: string): Promise<Car> {
    try {
      const prismaCarObject = await this.prisma.car.findFirst({
        where: {
          model: model,
        },
      });
      if (prismaCarObject === null) {
        throw new Error('object not found: ' + model);
      }
      return new Car(prismaCarObject.id, prismaCarObject.model);
    } catch (error) {
      console.log(error);
    }
  }

  async readAll(): Promise<Car[]> {
    try {
      const prismaObject = await this.prisma.car.findMany({});
      const cars: Car[] = [];
      for (let i = 0; i < prismaObject.length; i++) {
        cars.push(new Car(prismaObject[i].id, prismaObject[i].model));
      }
      return cars;
    } catch (error) {
      console.log(error);
    }
  }
}
