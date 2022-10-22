import { PrismaClient } from '@prisma/client';

export const seedHandler = async (): Promise<string> => {
  const prisma = new PrismaClient();

  const initCar = await prisma.car.deleteMany({});
  const initLocation = await prisma.location.deleteMany({});
  console.log('DELETE ALL');
  console.log(initCar);
  console.log(initLocation);

  console.log('LOCATIONS');
  const location1 = await prisma.location.create({
    data: {
      address: '東京都',
    },
  });
  console.log(location1);

  const location2 = await prisma.location.create({
    data: {
      address: '大阪府',
    },
  });
  console.log(location2);

  const location3 = await prisma.location.create({
    data: {
      address: '愛知県',
    },
  });
  console.log(location3);

  console.log('CARS');
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

  return JSON.stringify({
    cars: [car1, car2, car3],
    locations: [location1, location2, location3],
  });
};
