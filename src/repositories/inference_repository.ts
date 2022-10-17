import { DetectCustomLabelsCommandInput } from '@aws-sdk/client-rekognition';

export interface InferenceRepository {
  listPreInferenceImages(): Promise<string[]>;
  moveInferencedImage(): Promise<void[]>;
  newFilepath(locationId: string): Promise<string>;
  getLocationIdByFilepath(filepath: string): string;
  getTrafficVolumeIdByFilepath(filepath: string): string;
  getCreationDate(filepath: string): Promise<Date>;
  getRekognitionCommand(path: string): DetectCustomLabelsCommandInput;
}
