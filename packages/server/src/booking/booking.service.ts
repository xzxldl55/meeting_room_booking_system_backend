import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto';
import { InjectEntityManager } from '@nestjs/typeorm';
import { Between, EntityManager, Like } from 'typeorm';
import { User } from 'src/user/entities/user.entity';
import { MeetingRoom } from 'src/meeting-room/entities/meeting-room.entity';
import { Booking, BookingStatus } from './entities/booking.entity';

@Injectable()
export class BookingService {
  // 导入 entity 管理器可以查询任意数据库表
  @InjectEntityManager()
  private entityManager: EntityManager;

  async initData() {
    const user1 = await this.entityManager.findOneBy(User, {
      id: 3,
    });
    const user2 = await this.entityManager.findOneBy(User, {
      id: 2,
    });

    const room1 = await this.entityManager.findOneBy(MeetingRoom, {
      id: 12,
    });
    const room2 = await await this.entityManager.findOneBy(MeetingRoom, {
      id: 19,
    });

    const booking1 = new Booking();
    booking1.room = room1;
    booking1.user = user1;
    booking1.startTime = new Date();
    booking1.endTime = new Date(Date.now() + 1000 * 60 * 60);

    console.log(booking1);

    await this.entityManager.save(booking1);

    const booking2 = new Booking();
    booking2.room = room2;
    booking2.user = user2;
    booking2.startTime = new Date();
    booking2.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(booking2);

    const booking3 = new Booking();
    booking3.room = room1;
    booking3.user = user2;
    booking3.startTime = new Date();
    booking3.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(booking3);

    const booking4 = new Booking();
    booking4.room = room2;
    booking4.user = user1;
    booking4.startTime = new Date();
    booking4.endTime = new Date(Date.now() + 1000 * 60 * 60);

    await this.entityManager.save(booking4);
  }

  async add(createBookingDto: CreateBookingDto, userId: number) {
    if (createBookingDto.endTime <= createBookingDto.startTime) {
      throw new BadRequestException('结束时间必须大于开始时间');
    }

    const meetingRoom = await this.entityManager.findOneBy(MeetingRoom, {
      id: createBookingDto.meetingRoomId,
    });

    if (!meetingRoom) {
      throw new BadRequestException('会议室不存在');
    }

    const user = await this.entityManager.findOneBy(User, {
      id: userId,
    });

    const booking = new Booking();
    booking.room = meetingRoom;
    booking.user = user;
    booking.startTime = new Date(createBookingDto.startTime);
    booking.endTime = new Date(createBookingDto.endTime);
    booking.note = createBookingDto.note;

    /**
     * 检查是否存在时间段冲突
     * 全包含
     * 被包含
     * 包含前半段
     * 包含后半段
     */
    const occupyBooking = await this.entityManager
      .getRepository(Booking)
      .createQueryBuilder('booking')
      .where(
        'roomId = :roomId and (' +
          '(startTime <= :startTime and endTime >= :endTime)' + // 全包含
          'or (startTime >= :startTime and endTime <= :endTime))' + // 被包含
          'or (startTime <= :startTime and endTime > :startTime and endTime <= :endTime)' + // 包含前半段
          'or (startTime >= :startTime and startTime < :endTime and endTime >= :endTime)', // 包含后半段
        {
          roomId: meetingRoom.id,
          startTime: booking.startTime,
          endTime: booking.endTime,
        },
      )
      .getOne();

    console.log(occupyBooking);

    if (occupyBooking) {
      throw new BadRequestException('该时间段存在冲突');
    }

    try {
      await this.entityManager.insert(Booking, booking);
      return '预约成功';
    } catch (e) {
      throw new BadRequestException('预约失败');
    }
  }

  async find(
    pageIndex: number,
    pageSize: number,
    username: string,
    meetingRoomName: string,
    meetingRoomLocation: string,
    bookingTimeRangeStart: number,
    bookingTimeRangeEnd: number,
  ) {
    const skipCount = pageSize * (pageIndex - 1);

    const condition: Record<string, any> = {};

    if (username) {
      condition.user = {
        username: Like(`%${username}%`),
      };
    }
    if (meetingRoomName) {
      condition.room = {
        name: Like(`%${meetingRoomName}%`),
      };
    }
    if (meetingRoomLocation) {
      if (!condition.room) {
        condition.room = {};
      }
      condition.room.location = Like(`%${meetingRoomLocation}%`);
    }
    if (bookingTimeRangeStart) {
      condition.startTime = Between(
        new Date(bookingTimeRangeStart),
        new Date(bookingTimeRangeEnd ?? 1000 * 60 * 60 + bookingTimeRangeStart), // 未传截止时间默认是开始时间 1 小时后
      );
    }

    const [list, total] = await this.entityManager.findAndCount(Booking, {
      select: {
        user: {
          id: true,
          username: true,
          nickName: true,
          headPic: true,
        },
      },
      where: condition,
      relations: {
        user: true,
        room: true,
      },
      skip: skipCount,
      take: pageSize,
    });

    return {
      list,
      total,
      pageCount: Math.ceil(total / pageSize),
    };
  }

  async apply(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: BookingStatus.审批通过,
      },
    );

    return '审批通过';
  }

  async reject(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: BookingStatus.审批驳回,
      },
    );

    return '审批驳回';
  }

  async unbind(id: number) {
    await this.entityManager.update(
      Booking,
      {
        id,
      },
      {
        status: BookingStatus.已解除,
      },
    );

    return '已解除';
  }
}
