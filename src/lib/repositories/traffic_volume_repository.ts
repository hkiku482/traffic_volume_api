import { TrafficVolume } from '../domains/traffic_volume';

export interface TrafficVolumeRepository {
  create(trafficVolume: TrafficVolume): Promise<void>;
  readById(id: string): Promise<TrafficVolume>;
}
