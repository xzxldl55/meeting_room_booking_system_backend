import { useState } from 'react';
import { SearchMeetingRoom } from '../meeting_room_manage/meetingRoomManage';
import { UserSearchResult } from '../user_manage/userManage';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export enum BookingStatus {
	'申请中' = 0,
	'审批通过' = 1,
	'审批驳回' = 2,
	'已解除' = 3,
}

export interface BookingSearchResult {
	id: number;
	startTime: string;
	endTime: string;
	status: BookingStatus;
	note: string;
	createTime: string;
	updateTime: string;
	user: UserSearchResult;
	room: SearchMeetingRoom & { location: string };
}

export function BookingManage() {
	const [pageIndex, setPageIndex] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [bookingSearchResult] = useState<BookingSearchResult[]>([]);

	const columns: ColumnsType<BookingSearchResult> = [
		{
			title: '会议室名称',
			dataIndex: 'room',
			render(_, record) {
				return record.room.name;
			},
		},
		{
			title: '会议室位置',
			dataIndex: 'room',
			render(_, record) {
				return record.room.location;
			},
		},
		{
			title: '预定人',
			dataIndex: 'user',
			render(_, record) {
				return record.user.username;
			},
		},
		{
			title: '开始时间',
			dataIndex: 'startTime',
			render(_, record) {
				return dayjs(new Date(record.startTime)).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: '结束时间',
			dataIndex: 'endTime',
			render(_, record) {
				return dayjs(new Date(record.endTime)).format('YYYY-MM-DD HH:mm:ss');
			},
		},
		{
			title: '审批状态',
			dataIndex: 'status',
		},
		{
			title: '预定时间',
			dataIndex: 'createTime',
			render(_, record) {
				return dayjs(new Date(record.createTime)).format('YYYY-MM-DD hh:mm:ss');
			},
		},
		{
			title: '备注',
			dataIndex: 'note',
		},
		{
			title: '描述',
			dataIndex: 'description',
		},
		{
			title: '操作',
			render: (_, record) => <div></div>,
		},
	];

	return <div>订阅</div>;
}
