import {
  CopyObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Location, Car, PrismaClient } from '@prisma/client';
import { v4 } from 'uuid';

export const seedHandler = async (): Promise<string> => {
  const prisma = new PrismaClient();
  const sampleAmount = 500;
  let errorMessage = '';

  const locations: Location[] = [];

  const getRandom = (min: number, max: number): number => {
    min = Math.ceil(min);
    max = Math.ceil(max);
    return Math.floor(Math.random() * (max - min) + min);
  };

  try {
    const initTrafficVolume = await prisma.trafficVolume.deleteMany({});
    const initCar = await prisma.car.deleteMany({});
    const initLocation = await prisma.location.deleteMany({});
    console.log('DELETE ALL');
    console.log(initTrafficVolume);
    console.log(initCar);
    console.log(initLocation);

    console.log('LOCATIONS');
    const location1 = await prisma.location.create({
      data: {
        address: '昭和区',
      },
    });
    console.log(location1);
    locations.push(location1);

    const location2 = await prisma.location.create({
      data: {
        address: '瑞穂区',
      },
    });
    console.log(location2);
    locations.push(location2);

    const location3 = await prisma.location.create({
      data: {
        address: '中区',
      },
    });
    console.log(location3);
    locations.push(location3);

    const location4 = await prisma.location.create({
      data: {
        address: '熱田区',
      },
    });
    console.log(location4);
    locations.push(location4);

    const location5 = await prisma.location.create({
      data: {
        address: '中村区',
      },
    });
    console.log(location5);
    locations.push(location5);

    const cars: Car[] = [];
    console.log('CARS');
    const car1 = await prisma.car.create({
      data: {
        model: 'aqua',
      },
    });
    console.log(car1);
    cars.push(car1);

    const car2 = await prisma.car.create({
      data: {
        model: 'toyota86',
      },
    });
    console.log(car2);
    cars.push(car2);

    const car3 = await prisma.car.create({
      data: {
        model: 'yaris',
      },
    });
    console.log(car3);
    cars.push(car3);

    for (let i = 0; i < sampleAmount; i++) {
      const locationIndex = getRandom(0, locations.length);
      const carIndex = getRandom(0, cars.length);
      const trafficVolume = await prisma.trafficVolume.create({
        data: {
          id: v4(),
          carId: cars[carIndex].id,
          locationId: locations[locationIndex].id,
          imageId: 'NO_IMAGE',
          time: new Date(2022, 10, 25, getRandom(0, 24), 0, 0),
        },
      });
      console.log(
        'id: ' +
          trafficVolume.id +
          '\n' +
          'model: ' +
          cars[carIndex].model +
          '\n' +
          'location: ' +
          locations[locationIndex].address +
          '\n',
      );
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMessage += error.message + '\n';
    } else {
      console.log(error);
    }
  }

  const s3 = new S3Client({
    region: process.env.REGION,
  });

  // delete pre_inference, inrefenced
  // rm /pre_inference/*
  try {
    const preInferenceList = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: 'pre_inference/',
      }),
    );
    if (preInferenceList.Contents !== undefined) {
      const preInferenceObjects: { Key: string }[] = [];
      for (let i = 0; i < preInferenceList.Contents.length; i++) {
        preInferenceObjects.push({ Key: preInferenceList.Contents[i].Key });
      }
      preInferenceObjects.shift();

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Delete: {
          Objects: preInferenceObjects,
        },
      });
      s3.send(deleteCommand);
    }

    // rm /inferenced/*
    const inferencedList = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: 'inferenced/',
      }),
    );
    if (inferencedList.Contents !== undefined) {
      const inferencedObjects: { Key: string }[] = [];
      for (let i = 0; i < inferencedList.Contents.length; i++) {
        inferencedObjects.push({ Key: inferencedList.Contents[i].Key });
      }
      inferencedObjects.shift();

      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Delete: {
          Objects: inferencedObjects,
        },
      });
      s3.send(deleteCommand);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      errorMessage += error.message + '\n';
    } else {
      console.log(error);
    }
  }

  // list target files
  // optimization presentation/*
  try {
    const files = [];
    const prefix = 'presentation/';

    const res: ListObjectsCommandOutput = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: prefix,
      }),
    );

    if (res.Contents !== undefined) {
      for (let i = 0; i < res.Contents.length; i++) {
        files.push(res.Contents[i].Key);
      }
    }
    files.shift();

    for (let i = 0; i < files.length; i++) {
      console.log(files[i]);
    }

    // move
    for (let i = 0; i < files.length; i++) {
      const element = files[i];
      const newKey =
        prefix +
        v4() +
        '.' +
        locations[getRandom(0, locations.length)].id +
        '.jpg';
      const copyCommand = new CopyObjectCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        CopySource: process.env.RANDOM_S3_BUCKET + '/' + element,
        Key: newKey,
      });
      await s3.send(copyCommand);

      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Key: element,
      });
      s3.send(deleteCommand);
      console.log('optimized: ' + newKey);
    }
  } catch (error) {
    if (error instanceof Error) {
      errorMessage += error.message + '\n';
    } else {
      console.log(error);
    }
  }

  if (errorMessage === '') {
    return 'succeed';
  } else {
    return errorMessage;
  }
};
