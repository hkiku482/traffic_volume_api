import {
  CopyObjectCommand,
  DeleteObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  S3Client,
} from '@aws-sdk/client-s3';
import { Location, Car, PrismaClient } from '@prisma/client';
import { InferenceS3Bucket } from 'src/s3/inference';
import { v4 } from 'uuid';

export const seedHandler = async (): Promise<string> => {
  const prisma = new PrismaClient();

  const sampleAmount = 500;

  try {
    const initTrafficVolume = await prisma.trafficVolume.deleteMany({});
    const initCar = await prisma.car.deleteMany({});
    const initLocation = await prisma.location.deleteMany({});
    console.log('DELETE ALL');
    console.log(initTrafficVolume);
    console.log(initCar);
    console.log(initLocation);

    console.log('LOCATIONS');
    const locations: Location[] = [];
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

    const getRandom = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.ceil(max);
      return Math.floor(Math.random() * (max - min) + min);
    };

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

    // delete pre_inference, inrefenced

    // list target files
    const files = [];
    const prefix = 'presentation/';

    const s3 = new S3Client({
      region: process.env.REGION,
    });

    const inferencedDeleteRes = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: 'inferenced/',
      }),
    );

    const preInferenceFiles: string[] = [];
    if (inferencedDeleteRes.Contents !== undefined) {
      for (let i = 0; i < inferencedDeleteRes.Contents.length; i++) {
        preInferenceFiles.push(inferencedDeleteRes.Contents[i].Key);
      }
    }

    for (let i = 0; i < inferencedDeleteRes.Contents.length; i++) {
      const element = inferencedDeleteRes[i].k;
      const deleteCommand = new DeleteObjectCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Key: element,
      });
      s3.send(deleteCommand);
    }

    const preInferenceDeleteRes = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: 'pre_inference/',
      }),
    );

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

    return JSON.stringify({
      result: 'succeed',
    });
  } catch (error) {
    console.log(error);
    return JSON.stringify({
      result: 'failed',
    });
  }
};
