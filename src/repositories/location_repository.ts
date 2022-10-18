import { Location } from '../domains/location';

export interface LocationRepository {
  readById(id: string): Promise<Location>;
  readAll(): Promise<Location[]>;
}
