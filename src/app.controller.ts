import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { aggregateHandler } from './controller/aggregate_handler';
import { currentLocationHandler } from './controller/current_location_handler';
import { locationHandler } from './controller/location_handler';
import { presignedUrlHandler } from './controller/presigned_url_handler';
import { resultHandler } from './controller/result_handler';
import { seedHandler } from './controller/seed_handler';

@Controller('')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('aggregate')
  async aggregate(): Promise<string> {
    return aggregateHandler();
  }

  @Get('location')
  async locations(): Promise<string> {
    return locationHandler();
  }

  @Post('presigned_url')
  async presignedUrl(@Body() body: { location_id: string }): Promise<string> {
    return presignedUrlHandler(body.location_id);
  }

  @Post('current_location')
  async currentLocation(
    @Body() body: { location_id: string },
  ): Promise<string> {
    return currentLocationHandler(body.location_id);
  }

  @Get('result')
  async result_all(): Promise<string> {
    return resultHandler();
  }

  @Get(':id')
  async result(@Param() params: { id: string }): Promise<string> {
    return resultHandler(params.id);
  }

  @Get('seed')
  async seed(): Promise<string> {
    return seedHandler();
  }
}
