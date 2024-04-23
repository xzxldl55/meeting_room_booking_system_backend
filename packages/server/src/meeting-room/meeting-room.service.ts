import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateMeetingRoomDto } from './dto/create-meeting-room.dto';
import { UpdateMeetingRoomDto } from './dto/update-meeting-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeetingRoom } from './entities/meeting-room.entity';

@Injectable()
export class MeetingRoomService {
  @InjectRepository(MeetingRoom)
  private repository: Repository<MeetingRoom>;

  private logger = new Logger(MeetingRoomService.name);

  initData() {
    const room1 = new MeetingRoom();
    room1.name = '木星';
    room1.capacity = 10;
    room1.equipment = '白板';
    room1.location = '一层西';

    const room2 = new MeetingRoom();
    room2.name = '金星';
    room2.capacity = 5;
    room2.equipment = '';
    room2.location = '二层东';

    const room3 = new MeetingRoom();
    room3.name = '天王星';
    room3.capacity = 30;
    room3.equipment = '白板，电视';
    room3.location = '三层东';

    this.repository.insert([room1, room2, room3]);
  }

  async create(meetingRoomDto: CreateMeetingRoomDto) {
    const room = await this.repository.findOneBy({
      name: meetingRoomDto.name,
    });

    if (room) {
      throw new BadRequestException('会议室名字已存在');
    }

    return await this.repository.insert(meetingRoomDto);
  }

  async find(
    pageIndex: number,
    pageSize: number,
    name?: string,
    equipment?: string,
    capacity?: number,
  ) {
    if (pageIndex < 1) {
      throw new Error('页码必须大于0');
    }

    const skipCount = (pageIndex - 1) * pageSize;

    const condition: Record<string, any> = {};

    if (name) {
      condition.name = name;
    }
    if (equipment) {
      condition.equipment = equipment;
    }
    if (capacity) {
      condition.capacity = capacity;
    }

    const [meetingRooms, total] = await this.repository.findAndCount({
      skip: skipCount,
      take: pageSize,
      where: condition,
    });

    return {
      list: meetingRooms,
      total,
      pages: Math.ceil(total / pageSize),
    };
  }

  async findOne(id: number) {
    return await this.repository.findOneBy({
      id,
    });
  }

  async update(meetingRoomDto: UpdateMeetingRoomDto) {
    const meetingRoom = await this.repository.findOneBy({
      id: meetingRoomDto.id,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const keys = Object.keys(meetingRoomDto);
    for (const index in keys) {
      const key = keys[index];
      if (
        key in meetingRoomDto &&
        meetingRoomDto[key] !== null &&
        meetingRoomDto[key] !== undefined
      ) {
        meetingRoom[key] = meetingRoomDto[key];
      }
    }

    await this.repository.update(
      {
        id: meetingRoom.id,
      },
      meetingRoom,
    );

    return meetingRoom.id;
  }

  async remove(id: number) {
    const res = await this.repository.delete({
      id,
    });

    return { count: res.affected };
  }
}
