import { Aggregate, AggregateInteractorInput } from 'src/interactors/aggregate';
import { CarMysql } from 'src/mysql/car';
import { LocationMysql } from 'src/mysql/location';
import { TrafficVolumeMysql } from 'src/mysql/traffic_volume';
import { InferenceS3Bucket } from 'src/s3/inference';

export const aggregateHandler = async (): Promise<string> => {
  const input: AggregateInteractorInput = {
    inrefenceRepository: new InferenceS3Bucket(),
    trafficVolumeRepository: new TrafficVolumeMysql(),
    carRepository: new CarMysql(),
    locationRepository: new LocationMysql(),
  };
  const aggregate = new Aggregate(input);

  let message = '';
  try {
    await aggregate.handler();
    message = 'succeed';
  } catch (e: unknown) {
    console.log(e);
    if (e instanceof Error) {
      message = e.message;
    } else {
      message = 'error occurred';
    }
  }

  return JSON.stringify({ state: message });
};
