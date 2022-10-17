import { Car } from './car';
import { Location } from './location';

export class TrafficVolume {
  id: string;
  imageId: string;
  location: Location;
  car: Car;
  time: Date;

  constructor(
    id: string,
    imageId: string,
    location: Location,
    car: Car,
    time: Date,
  ) {
    this.id = id;
    this.imageId = imageId;
    this.location = location;
    this.car = car;
    this.time = time;
  }
}
