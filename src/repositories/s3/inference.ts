import { DetectCustomLabelsCommandInput } from '@aws-sdk/client-rekognition';
import {
  GetObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 } from 'uuid';
import { InferenceRepository } from '../inference_repository';

export class InferenceS3Bucket implements InferenceRepository {
  private readonly prefix: string = 'pre_inference/';

  async listPreInferenceImages(): Promise<string[]> {
    const files = [];

    const s3 = new S3Client({
      region: process.env.REGION,
    });
    const res: ListObjectsCommandOutput = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: this.prefix,
      }),
    );

    if (res.Contents === undefined) return [];

    for (let i = 0; i < res.Contents.length; i++) {
      files.push(res.Contents[i].Key);
    }

    return files;
  }

  async moveInferencedImage(): Promise<void[]> {
    throw new Error('Method not implemented.');
  }

  async newFilepath(locationId: string): Promise<string> {
    // example: directory/uuid-uuid.location-id.jpeg
    const bucketKey = this.prefix + v4() + '.' + locationId + '.jpeg';
    const s3 = new S3Client({ region: process.env.RANDOM_S3_BUCKET });

    const command = new PutObjectCommand({
      Bucket: process.env.RANDOM_S3_BUCKET,
      Key: bucketKey,
      ContentType: 'image/jpeg',
      ContentEncoding: 'base64',
    });

    return await getSignedUrl(s3, command);
  }

  getLocationIdByFilepath(filepath: string): string {
    // split FILENAME (/dir/dir/FILENAME) with '.'
    const filename = filepath.split('/').slice(-1)[0].split('.');
    if (filename.length != 3) {
      throw new Error('invalid filename format: ' + filepath);
    }
    return filename[1];
  }

  getTrafficVolumeIdByFilepath(filepath: string): string {
    // split FILENAME (/dir/dir/FILENAME) with '.'
    const filename = filepath.split('/').slice(-1)[0].split('.');
    if (filename.length != 3) {
      throw new Error('invalid filename format: ' + filepath);
    }
    return filename[0];
  }

  async getCreationDate(filepath: string): Promise<Date> {
    const s3 = new S3Client({ region: process.env.REGION });
    const res = await s3.send(
      new GetObjectCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Key: filepath,
      }),
    );
    if (res.LastModified === undefined) {
      throw new Error('creation date not found');
    }
    return res.LastModified;
  }

  getRekognitionCommand(path: string): DetectCustomLabelsCommandInput {
    return {
      Image: {
        S3Object: {
          Bucket: process.env.RANDOM_S3_BUCKET,
          Name: path,
        },
      },
      ProjectVersionArn: process.env.REKOGNITION_CUSTOM_LABELS_ARN,
    };
  }
}
