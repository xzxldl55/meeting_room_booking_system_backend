import { CreateMeetingRoom } from '../views/meeting_room_manage/createMeetingRoomModal';
import { SearchMeetingRoom } from '../views/meeting_room_manage/meetingRoomManage';
import { UpdateMeetingRoom } from '../views/meeting_room_manage/updateMeetingRoomModal';
import { SearchUser } from '../views/user_manage/userManage';
import { axiosInstance } from 'tools';

export type PageParams = {
	pageSize: number;
	pageIndex: number;
};

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
