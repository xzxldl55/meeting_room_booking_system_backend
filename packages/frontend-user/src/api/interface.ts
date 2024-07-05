import { axiosInstance } from 'tools';
import { SearchMeetingRoom } from '../views/meeting_room_list/MeetingRoomList';
import { SearchBooking } from '../views/booking_history/BookingHistory';
import dayjs from 'dayjs'

export interface LoginUser {
	username: string;
	password: string;
}

export async function login(data: LoginUser) {
	return await axiosInstance.post('/user/login', data);
}

export interface RegisterUser {
	username: string;
	nickName: string;
	password: string;
	confirmPassword: string;
	email: string;
	captcha: string;
}

export async function registerCaptcha(address: string) {
	return await axiosInstance.get('/user/captcha/register', {
		params: { address },
	});
}

export async function register(data: RegisterUser) {
	return await axiosInstance.post('/user/register', data);
}

export interface UpdatePasswordParam {
	email: string;
	captcha: string;
	password: string;
	confirmPassword: string;
}

export async function updatePasswordCaptcha(address: string) {
	return await axiosInstance.get('/user/captcha/update_password', {
		params: { address },
	});
}

export async function updatePassword(data: UpdatePasswordParam) {
	return await axiosInstance.post('/user/update_password', data);
}

export async function getUserInfo() {
	return await axiosInstance.get('/user/info');
}

export async function updateUserCaptcha() {
	return await axiosInstance.get('/user/captcha/update_user');
}

export interface UserInfo {
	headPic: string;
	nickName: string;
	captcha: string;
}

export async function updateUserInfo(data: UserInfo) {
	return await axiosInstance.post('/user/update', data);
}

export async function searchMeetingRoomList(params: SearchMeetingRoom & { pageIndex: number; pageSize: number }) {
	return await axiosInstance.get('/meeting-room/list', {
		params,
	});
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

export async function unbind(id: number) {
	return await axiosInstance.get('/booking/unbind/' + id);
}