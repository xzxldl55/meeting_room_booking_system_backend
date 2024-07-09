import { Controller, Get, Inject, Query } from '@nestjs/common';
import { StatisticsService } from './statistics.service';

@Controller('statistics')
export class StatisticsController {
  @Inject(StatisticsService)
  private statisticsService: StatisticsService;

  @Get('user')
  async userStatistics(
    @Query('rangeStart') rangeStart: string,
    @Query('rangeEnd') rangeEnd: string,
  ) {
    return await this.statisticsService.userBookingCount(rangeStart, rangeEnd);
  }

  @Get('meeting-room')
  async meetingRoomStatistics(
    @Query('rangeStart') rangeStart: string,
    @Query('rangeEnd') rangeEnd: string,
  ) {
    return await this.statisticsService.meetingRoomCount(rangeStart, rangeEnd);
  }
}
