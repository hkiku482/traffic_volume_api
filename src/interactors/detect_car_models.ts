import {
  Rekognition,
  DetectCustomLabelsCommand,
} from '@aws-sdk/client-rekognition';
import { DetectModelsUsecase } from '../../lib/usecases/detect_models_usecase';

export class DetectCarModels implements DetectModelsUsecase {
  private readonly filepath: string;

  constructor(filepath: string) {
    this.filepath = filepath;
  }

  async handler(): Promise<string[]> {
    // Execute Amazon Rekognition API.
    const rekognition = new Rekognition({
      region: process.env.REGION,
    });
    const res = await rekognition.send(
      new DetectCustomLabelsCommand({
        Image: {
          S3Object: {
            Bucket: process.env.RANDOM_S3_BUCKET,
            Name: this.filepath,
          },
        },
        ProjectVersionArn: process.env.REKOGNITION_CUSTOM_LABELS_ARN,
      }),
    );

    // Optimization the data structure.
    if (res.CustomLabels === undefined) return [];
    if (res.CustomLabels.length === 0) {
      console.log('CAR: 検出されませんでした');
      return [];
    }
    const labels: string[] = [];
    for (let i = 0; i < res.CustomLabels.length; i++) {
      if (res.CustomLabels[i].Name === undefined) continue;
      if (res.CustomLabels[i].Confidence === undefined) continue;
      if (res.CustomLabels[i].Confidence < 70) {
        console.log(
          'CAR: 低確率のためスキップしました (' + res.CustomLabels[i] + ' %)',
        );
        continue;
      }
      labels.push(res.CustomLabels[i].Name);
      console.log(
        'CAR: ' +
          res.CustomLabels[i].Name +
          'が検出されました (' +
          res.CustomLabels[i].Confidence +
          ' %)',
      );
    }
    return labels;
  }
}
