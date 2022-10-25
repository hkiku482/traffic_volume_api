import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsCommand,
  ListObjectsCommandOutput,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 } from 'uuid';
import { InferenceRepository } from '../../lib/repositories/inference_repository';

export class InferenceS3Bucket implements InferenceRepository {
  private readonly prefixPreInference: string = 'pre_inference/';
  private readonly prefixInferenced: string = 'inferenced/';

  async listPreInferenceImages(): Promise<string[]> {
    const files = [];

    const s3 = new S3Client({
      region: process.env.REGION,
    });
    const res: ListObjectsCommandOutput = await s3.send(
      new ListObjectsCommand({
        Bucket: process.env.RANDOM_S3_BUCKET,
        Prefix: this.prefixPreInference,
      }),
    );

    if (res.Contents === undefined) return [];

    for (let i = 0; i < res.Contents.length; i++) {
      files.push(res.Contents[i].Key);
    }

    files.shift();

    return files;
  }

  async moveInferencedImage(filepath: string): Promise<void> {
    const newKey = this.prefixInferenced + filepath.split('/').slice(-1)[0];
    const s3 = new S3Client({ region: process.env.REGION });

    const copyCommand = new CopyObjectCommand({
      Bucket: process.env.RANDOM_S3_BUCKET,
      CopySource: process.env.RANDOM_S3_BUCKET + '/' + filepath,
      Key: newKey,
    });
    await s3.send(copyCommand);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.RANDOM_S3_BUCKET,
      Key: filepath,
    });
    await s3.send(deleteCommand);
  }

  async newFilepath(locationId: string): Promise<string> {
    // example: directory/uuid-uuid.location-id.jpeg
    const bucketKey =
      this.prefixPreInference + v4() + '.' + locationId + '.jpeg';
    const s3 = new S3Client({ region: process.env.REGION });

    const command = new PutObjectCommand({
      Bucket: process.env.RANDOM_S3_BUCKET,
      Key: bucketKey,
      ContentType: 'image/jpeg',
    });

    return await getSignedUrl(s3, command, { expiresIn: 300 });
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
}
