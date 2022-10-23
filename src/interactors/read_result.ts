import { Result } from 'src/lib/domains/result';
import { CarRepository } from 'src/lib/repositories/car_repository';
import { LocationRepository } from 'src/lib/repositories/location_repository';
import { TrafficVolumeRepository } from 'src/lib/repositories/traffic_volume_repository';
import { ReadResultUsecase } from 'src/lib/usecases/read_result_usecase';

export class ReadResult implements ReadResultUsecase {
  private readonly trafficVolumeRepository: TrafficVolumeRepository;
  private readonly carRepository: CarRepository;

  constructor(input: ReadResultInput) {
    this.trafficVolumeRepository = input.trafficVolumeRepository;
    this.carRepository = input.carRepository;
  }

  async overall(): Promise<Result> {
    return await this.readTrafficVolume();
  }

  async locationDetail(locationId: string): Promise<Result> {
    return await this.readTrafficVolume(locationId);
  }

  private async readTrafficVolume(locationId = ''): Promise<Result> {
    const cars = await this.carRepository.readAll();
    const result = new Result([], []);

    // The traffic volume by car model.
    for (let i = 0; i < cars.length; i++) {
      const trafficVolumeByModel =
        await this.trafficVolumeRepository.readTrafficVolumeByModel(
          cars[i].id,
          locationId,
        );
      result.models.push({
        model_name: cars[i].model,
        traffic_volume: trafficVolumeByModel,
      });
    }

    // The hourly traffic volume.
    for (let i = 0; i < 24; i++) {
      const trafficVolumeByTime =
        await this.trafficVolumeRepository.readTrafficVolumeByTime(
          i,
          locationId,
        );
      result.time.push({
        time: i.toString(),
        traffic_volume: trafficVolumeByTime,
      });
    }

    console.log('result:\n' + result);
    return result;
  }
}

export type ReadResultInput = {
  trafficVolumeRepository: TrafficVolumeRepository;
  carRepository: CarRepository;
  locationRepository: LocationRepository;
};
