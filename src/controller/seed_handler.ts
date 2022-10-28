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
  const main = async () => {
    const prisma = new PrismaClient();
    const sampleAmount = 1000;

    const locations: Location[] = [];
    const getRandom = (min: number, max: number): number => {
      min = Math.ceil(min);
      max = Math.ceil(max);
      return Math.floor(Math.random() * (max - min) + min);
    };
    const s3 = new S3Client({
      region: process.env.REGION,
    });
    let msg = '';

    try {
      await prisma.trafficVolume.deleteMany({});
      await prisma.car.deleteMany({});
      await prisma.location.deleteMany({});

      const location1 = await prisma.location.create({
        data: {
          address: '昭和区',
        },
      });
      locations.push(location1);

      const location2 = await prisma.location.create({
        data: {
          address: '瑞穂区',
        },
      });
      locations.push(location2);

      const location3 = await prisma.location.create({
        data: {
          address: '中区',
        },
      });
      locations.push(location3);

      const location4 = await prisma.location.create({
        data: {
          address: '熱田区',
        },
      });
      locations.push(location4);

      const location5 = await prisma.location.create({
        data: {
          address: '中村区',
        },
      });
      locations.push(location5);

      const cars: Car[] = [];
      const car1 = await prisma.car.create({
        data: {
          model: 'aqua',
        },
      });
      cars.push(car1);

      const car2 = await prisma.car.create({
        data: {
          model: 'toyota86',
        },
      });
      cars.push(car2);

      const car3 = await prisma.car.create({
        data: {
          model: 'yaris',
        },
      });
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
    } catch (e: unknown) {
      if (e instanceof Error) {
        msg += e.message + '\n';
      }
    }

    try {
      // delete pre_inference, inrefenced
      // rm /pre_inference/*
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

        if (preInferenceObjects.length !== 0) {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: process.env.RANDOM_S3_BUCKET,
            Delete: {
              Objects: preInferenceObjects,
            },
          });
          s3.send(deleteCommand);
        }
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

        if (inferencedObjects.length !== 0) {
          const deleteCommand = new DeleteObjectsCommand({
            Bucket: process.env.RANDOM_S3_BUCKET,
            Delete: {
              Objects: inferencedObjects,
            },
          });
          s3.send(deleteCommand);
        }
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        msg += e.message + '\n';
      }
    }

    try {
      // list target files
      // optimization presentation/*
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
        console.log('updated: ' + newKey);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        msg += e.message + '\n';
      }
    }

    if (msg !== '') {
      throw Error(msg);
    }
    return 'succeed';
  };

  try {
    await main();
    return 'succeed\n';
  } catch (error) {
    return error;
  }
};
