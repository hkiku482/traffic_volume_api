import { InferenceS3Bucket } from 'src/s3/inference';

export const presignedUrlHandler = async (
  location_id: string,
): Promise<string> => {
  if (location_id === '') {
    return '"location_id" of json key is not found';
  }

  const randomBucket = new InferenceS3Bucket();
  const url = await randomBucket.newFilepath(location_id);
  console.log(url);
  return JSON.stringify({
    presigned_url: url,
  });
};
