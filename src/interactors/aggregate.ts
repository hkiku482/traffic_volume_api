import { v4 } from 'uuid';
import { TrafficVolume } from '../../lib/domains/traffic_volume';
import { CarRepository } from '../../lib/repositories/car_repository';
import { InferenceRepository } from '../../lib/repositories/inference_repository';
import { LocationRepository } from '../../lib/repositories/location_repository';
import { TrafficVolumeRepository } from '../../lib/repositories/traffic_volume_repository';
import { AggregateUsecase } from '../../lib/usecases/aggregate_usecase';
import { DetectCarModels } from './detect_car_models';

export class Aggregate implements AggregateUsecase {
  private readonly inrefenceRepository: InferenceRepository;
  private readonly trafficVolumeRepository: TrafficVolumeRepository;
  private readonly carRepository: CarRepository;
  private readonly locationRepository: LocationRepository;

  constructor(input: AggregateInteractorInput) {
    this.inrefenceRepository = input.inrefenceRepository;
    this.trafficVolumeRepository = input.trafficVolumeRepository;
    this.carRepository = input.carRepository;
    this.locationRepository = input.locationRepository;
  }

  async handler(): Promise<void> {
    if (
      process.env.RANDOM_S3_BUCKET === undefined ||
      process.env.REKOGNITION_CUSTOM_LABELS_ARN === undefined
    ) {
      throw Error('failed to load env');
    }

    // Get source files.
    const files: string[] =
      await this.inrefenceRepository.listPreInferenceImages();

    for (let i = 0; i < files.length; i++) {
      console.log('target' + (i + 1) + ': ' + files[i]);
    }

    const trafficVolume: TrafficVolume[] = [];

    for (let i = 0; i < files.length; i++) {
      const detectModels = new DetectCarModels(files[i]);

      // Execute detection.
      const labels = await detectModels.handler();

      // Optimization the data structure.
      const location = await this.locationRepository.readById(
        this.inrefenceRepository.getLocationIdByFilepath(files[i]),
      );
      console.log('LOCATION: ' + location.address);

      const trafficVolumeId =
        this.inrefenceRepository.getTrafficVolumeIdByFilepath(files[i]);
      const date = await this.inrefenceRepository.getCreationDate(files[i]);

      // Move images from pre_inference/ to inferenced/
      this.inrefenceRepository.moveInferencedImage(files[i]);

      if (labels.length === 0) continue;

      for (let k = 0; k < labels.length; k++) {
        const car = await this.carRepository.readByModel(labels[k]);
        trafficVolume.push(
          new TrafficVolume(v4(), trafficVolumeId, location, car, date),
        );
      }
    }

    for (let i = 0; i < trafficVolume.length; i++) {
      this.trafficVolumeRepository.create(trafficVolume[i]);
    }
  }
}

export type AggregateInteractorInput = {
  inrefenceRepository: InferenceRepository;
  trafficVolumeRepository: TrafficVolumeRepository;
  carRepository: CarRepository;
  locationRepository: LocationRepository;
};
