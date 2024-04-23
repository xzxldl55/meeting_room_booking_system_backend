import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Query,
  Put,
  DefaultValuePipe,
} from '@nestjs/common';
import { MeetingRoomService } from './meeting-room.service';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';
import { Repository } from 'typeorm';

@Controller('meeting-room')
export class MeetingRoomController {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post('create')
  async create(@Body() meetingRoomDto: CreateMeetingRoomDto) {
    return await this.meetingRoomService.create(meetingRoomDto);
  }

  @Get('list')
  async findAll(
    @Query('pageIndex', new DefaultValuePipe(1))
    pageIndex: number,
    @Query('pageSize', new DefaultValuePipe(10))
    pageSize: number,
    @Query('name') name?: string,
    @Query('equipment') equipment?: string,
    @Query('capacity') capacity?: number,
  ) {
    return await this.meetingRoomService.find(
      pageIndex,
      pageSize,
      name,
      equipment,
      capacity,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.meetingRoomService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.meetingRoomService.remove(+id);
  }

  @Put('update')
  async update(@Body() meetingRoomDto: UpdateMeetingRoomDto) {
    return await this.meetingRoomService.update(meetingRoomDto);
  }
}
