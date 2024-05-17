import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { GetUserParam, RequireLogin } from 'src/decorators';

@RequireLogin()
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post('add')
  add(
    @Body() createBookingDto: CreateBookingDto,
    @GetUserParam('userId') userId: number,
  ) {
    return this.bookingService.add(createBookingDto, userId);
  }

  @Get('list')
  async list(
    @Query('pageIndex', new DefaultValuePipe(1), ParseIntPipe)
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(10), ParseIntPipe) pageSize: number,
    @Query('username') username: string,
    @Query('meetingRoomName') meetingRoomName: string,
    @Query('meetingRoomLocation') meetingRoomLocation: string,
    @Query('bookingTimeRangeStart') bookingTimeRangeStart: number,
    @Query('bookingTimeRangeEnd') bookingTimeRangeEnd: number,
  ) {
    return this.bookingService.find(
      pageIndex,
      pageSize,
      username,
      meetingRoomName,
      meetingRoomLocation,
      bookingTimeRangeStart,
      bookingTimeRangeEnd,
    );
  }

  @Get('apply/:id')
  async apply(@Param('id') id: number) {
    return this.bookingService.apply(id);
  }

  @Get('reject/:id')
  async reject(@Param('id') id: number) {
    return this.bookingService.reject(id);
  }

  @Get('unbind/:id')
  async unbind(@Param('id') id: number) {
    return this.bookingService.unbind(id);
  }

  @Get('urge/:id')
  async urge(@Param('id') id: number) {
    return this.bookingService.urge(id);
  }
}
