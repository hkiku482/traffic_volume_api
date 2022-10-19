import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { aggregateHandler } from './controller/aggregate_handler';
import { locationHandler } from './controller/location_handler';
import { presignedUrlHandler } from './controller/presigned_url_handler';
import { resultHandler } from './controller/result_handler';
import { seedHandler } from './controller/seed_handler';
import { Location } from './domains/location';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('aggregate')
  async aggregate(): Promise<string> {
    return aggregateHandler();
  }

  @Post('presigned_url')
  async presignedUrl(@Body() body: { location_id: string }): Promise<string> {
    return presignedUrlHandler(body.location_id);
  }

  @Get('result')
  async result(): Promise<string> {
    return resultHandler();
  }

  @Get('location')
  async locations(): Promise<string> {
    // return locationHandler();
    const locations = [];
    locations.push(new Location('111', 'location1'));
    locations.push(new Location('222', 'location2'));
    locations.push(new Location('333', 'location3'));
    locations.push(new Location('444', 'location4'));
    return JSON.stringify(locations);
  }

  @Get('seed')
  async seed(): Promise<string> {
    // return seedHandler();
    return '';
  }

  @Get('debug')
  async debug(): Promise<string> {
    return 'hello';
  }
}
