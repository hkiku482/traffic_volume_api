import { Result } from '../domains/result';

export interface ReadResultUsecase {
  overall(): Promise<Result>;
  locationDetail(locationId: string): Promise<Result>;
}
