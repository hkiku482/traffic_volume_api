import { PrismaClient } from '@prisma/client';

export const seedHandler = async (): Promise<string> => {
  const prisma = new PrismaClient();

  const car1 = await prisma.car.create({
    data: {
      model: 'aqua',
    },
  });
  console.log(car1);

  const car2 = await prisma.car.create({
    data: {
      model: 'toyota86',
    },
  });
  console.log(car2);

  const car3 = await prisma.car.create({
    data: {
      model: 'yaris',
    },
  });
  console.log(car3);

  return JSON.stringify({ objects: [car1, car2, car3] });
};
