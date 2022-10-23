export interface DetectModelsUsecase {
  handler(): Promise<string[]>;
}
