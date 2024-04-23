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
