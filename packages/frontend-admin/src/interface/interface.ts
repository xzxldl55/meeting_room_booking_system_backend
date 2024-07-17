import dayjs from 'dayjs';
import { SearchBooking } from '../views/booking_manage/bookingManage';
import { CreateMeetingRoom } from '../views/meeting_room_manage/createMeetingRoomModal';
import { SearchMeetingRoom } from '../views/meeting_room_manage/meetingRoomManage';
import { UpdateMeetingRoom } from '../views/meeting_room_manage/updateMeetingRoomModal';
import { SearchUser } from '../views/user_manage/userManage';
import { createAxiosInstance } from 'tools';

export type PageParams = {
	pageSize: number;
	pageIndex: number;
};

const axiosInstance = createAxiosInstance();

export async function login(username: string, password: string) {
	return await axiosInstance.post(
		'/user/admin/login',
		{
			username,
			password,
		},
		{
			hideErrorMessage: true,
		}
	);
}

export async function searchUsers(params: SearchUser & PageParams) {
	return await axiosInstance.get('/user/list', {
		params,
		hideErrorMessage: true,
	});
}

export async function freezeUser(id: string) {
	return await axiosInstance.get('/user/freeze', {
		params: { id },
	});
}

export async function getMeetingRoomList(params: SearchMeetingRoom & { pageIndex: number; pageSize: number }) {
	return await axiosInstance.get('/meeting-room/list', {
		params,
	});
}

export async function deleteMeetingRoom(id: number) {
	return await axiosInstance.delete('/meeting-room/' + id);
}

export async function createMeetingRoom(meetingRoom: CreateMeetingRoom) {
	return await axiosInstance.post('/meeting-room/create', meetingRoom);
}

export async function updateMeetingRoom(meetingRoom: UpdateMeetingRoom & { id: number }) {
	return await axiosInstance.put('/meeting-room/update', meetingRoom);
}

export async function findMeetingRoom(id: number) {
	return await axiosInstance.get('/meeting-room/' + id);
}

export async function apply(id: number) {
	return await axiosInstance.get('/booking/apply/' + id);
}

export async function reject(id: number) {
	return await axiosInstance.get('/booking/reject/' + id);
}

export async function unbind(id: number) {
	return await axiosInstance.get('/booking/unbind/' + id);
}

export async function getBookingList(params: SearchBooking & { pageIndex: number; pageSize: number }) {
	let bookingTimeRangeStart, bookingTimeRangeEnd;

	if (params.rangeStartTime) {
		bookingTimeRangeStart = dayjs(params.rangeStartTime).format('YYYY-MM-DD HH:mm:ss');
	}

	if (params.rangeEndTime) {
		bookingTimeRangeEnd = dayjs(params.rangeEndTime).format('YYYY-MM-DD HH:mm:ss');
	}

	return await axiosInstance.get('/booking/list', {
		params: {
			...params,
			bookingTimeRangeStart,
			bookingTimeRangeEnd
		}
	})
}

export async function getUserStatistics(rangeStart?: string, rangeEnd?: string) {
	return await axiosInstance.get('/statistics/user', {
		params: {
			rangeStart,
			rangeEnd
		}
	});
}

export async function getMeetingRoomStatistics(rangeStart?: string, rangeEnd?: string) {
	return await axiosInstance.get('/statistics/meeting-room', {
		params: {
			rangeStart,
			rangeEnd
		}
	});
}
