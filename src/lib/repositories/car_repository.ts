import { Car } from '../domains/car';

export interface CarRepository {
  readById(id: string): Promise<Car>;
  readByModel(model: string): Promise<Car>;
  readAll(): Promise<Car[]>;
}
