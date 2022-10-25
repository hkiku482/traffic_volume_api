import { ReadResult, ReadResultInput } from 'src/interactors/read_result';
import { CarMysql } from 'src/mysql/car';
import { LocationMysql } from 'src/mysql/location';
import { TrafficVolumeMysql } from 'src/mysql/traffic_volume';

export const resultHandler = async (locationsId = ''): Promise<string> => {
  const input: ReadResultInput = {
    carRepository: new CarMysql(),
    locationRepository: new LocationMysql(),
    trafficVolumeRepository: new TrafficVolumeMysql(),
  };
  const readResult = new ReadResult(input);

  try {
    const result =
      locationsId === ''
        ? await readResult.overall()
        : await readResult.locationDetail(locationsId);
    return JSON.stringify({
      results: result,
    });
  } catch (error) {
    return JSON.stringify({
      error: error,
    });
  }
};
