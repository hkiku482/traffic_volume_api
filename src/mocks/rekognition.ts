import { DetectModelsUsecase } from 'src/lib/usecases/detect_models_usecase';

export class RekognitionMock implements DetectModelsUsecase {
  private readonly models: string[] = ['prius', 'toyota86', 'yaris'];

  handler(): Promise<string[]> {
    return new Promise(() => {
      this.models;
    });
  }
}
