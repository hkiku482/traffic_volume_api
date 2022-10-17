import {
  Rekognition,
  DetectCustomLabelsCommand,
} from '@aws-sdk/client-rekognition';
import { InferenceRepository } from '../repositories/inference_repository';
import { DetectModels } from '../usecases/detect_models';

export class DetectCarModels implements DetectModels {
  private readonly inferenceRepository: InferenceRepository;
  private readonly filepath: string;

  constructor(inferenceRepository: InferenceRepository, filepath: string) {
    this.inferenceRepository = inferenceRepository;
    this.filepath = filepath;
  }

  async handler(): Promise<string[]> {
    // Execute Amazon Rekognition API.
    const rekognition = new Rekognition({
      region: process.env.REGION,
    });
    const res = await rekognition.send(
      new DetectCustomLabelsCommand(
        this.inferenceRepository.getRekognitionCommand(this.filepath),
      ),
    );

    // Move images from pre_inference/ to inferenced/
    this.inferenceRepository.moveInferencedImage();

    if (res.CustomLabels === undefined) return [];
    const labels: string[] = [];
    for (let i = 0; i < res.CustomLabels.length; i++) {
      if (res.CustomLabels[i].Name === undefined) continue;
      if (res.CustomLabels[i].Confidence === undefined) continue;
      if ((res.CustomLabels[i].Confidence ?? '') < 70) {
        labels.push(res.CustomLabels[i].Name ?? '');
      }
    }

    return labels;
  }
}
