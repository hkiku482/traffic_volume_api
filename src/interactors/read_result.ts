import { Result } from 'src/lib/domains/result';
import { CarRepository } from 'src/lib/repositories/car_repository';
import { LocationRepository } from 'src/lib/repositories/location_repository';
import { TrafficVolumeRepository } from 'src/lib/repositories/traffic_volume_repository';
import { ReadResultUsecase } from 'src/lib/usecases/read_result_usecase';

class ReadResult implements ReadResultUsecase {
  private readonly trafficVolumeRepository: TrafficVolumeRepository;
  private readonly carRepository: CarRepository;
  private readonly locationRepository: LocationRepository;

  constructor(input: ReadResultInput) {
    this.trafficVolumeRepository = input.trafficVolumeRepository;
    this.carRepository = input.carRepository;
    this.locationRepository = input.locationRepository;
  }

  overall(): Promise<Result> {
    throw new Error('Method not implemented.');
  }

  locationDetail(locationId: string): Promise<Result> {
    throw new Error('Method not implemented.');
  }
}

export type ReadResultInput = {
  trafficVolumeRepository: TrafficVolumeRepository;
  carRepository: CarRepository;
  locationRepository: LocationRepository;
};
