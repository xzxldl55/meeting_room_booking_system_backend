import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Booking } from 'src/booking/entities/booking.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { User } from 'src/user/entities/user.entity';
import { EntityManager } from 'typeorm';

@Injectable()
export class StatisticsService {
  @InjectEntityManager()
  private entityManage: EntityManager;

  async userBookingCount(rangeStart: string, rangeEnd: string) {
    return await this.entityManage
      .createQueryBuilder(Booking, 'b')
      .select('u.id', 'id')
      .addSelect('u.username', 'name')
      .addSelect('count(1)', 'count')
      .leftJoin(User, 'u', 'u.id = b.userId')
      .where('b.startTime between :time1 and :time2', {
        time1: rangeStart,
        time2: rangeEnd,
      })
      .addGroupBy('b.user') // 按照 entity 中的外键指标进行分组查询
      .getRawMany();
  }

  async meetingRoomCount(rangeStart: string, rangeEnd: string) {
    return await this.entityManage
      .createQueryBuilder(Booking, 'b')
      .select('m.id', 'id')
      .addSelect('m.name', 'name')
      .addSelect('count(1)', 'count')
      .leftJoin(MeetingRoom, 'm', 'm.id = b.roomId')
      .where('b.startTime between :time1 and :time2', {
        time1: rangeStart,
        time2: rangeEnd,
      })
      .addGroupBy('b.room')
      .getRawMany();
  }
}
