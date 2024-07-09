import { useEffect, useState } from 'react';
import { MeetingRoom } from '../meeting_room_manage/meetingRoomManage';
import { UserSearchResult } from '../user_manage/userManage';
import Table, { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { useForm } from 'antd/es/form/Form';
import { Input, DatePicker, Button, Form, Popconfirm, message } from 'antd';
import './bookingManage.css';
import { apply, getBookingList, reject, unbind } from '../../interface/interface';

export enum BookingStatus {
	'申请中' = 0,
	'审批通过' = 1,
	'审批驳回' = 2,
	'已解除' = 3,
}

export type BookingStatusText = keyof typeof BookingStatus;

export interface SearchBooking {
	username: string;
	meetingRoomName: string;
	meetingRoomLocation: string;
	rangeStartTime: Date;
	rangeEndTime: Date;
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
	room: MeetingRoom;
}

export function BookingManage() {
	const [pageIndex, setPageIndex] = useState(1);
	const [pageSize, setPageSize] = useState(5);
	const [total, setTotal] = useState(0);
	const [bookingSearchResult, setBookingSearchResult] = useState<BookingSearchResult[]>([]);
	const [refreshNum, setRefreshNum] = useState(0);

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
			render: (value) => BookingStatus[value],
			onFilter: (value, record) => record.status === value,
			filters: [
				{
					text: BookingStatus[0],
					value: 0,
				},
				{
					text: BookingStatus[1],
					value: 1,
				},
				{
					text: BookingStatus[2],
					value: 2,
				},
				{
					text: BookingStatus[3],
					value: 3,
				},
			],
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
			render: (_, record) => (
				<div>
					<Popconfirm
						title="通过申请"
						description="确认通过吗？"
						onConfirm={() => changeStatus(record.id, 'apply')}
						okText="Yes"
						cancelText="No"
					>
						<a>通过</a>
					</Popconfirm>
					<br />
					<Popconfirm
						title="驳回申请"
						description="确认驳回吗？"
						onConfirm={() => changeStatus(record.id, 'reject')}
						okText="Yes"
						cancelText="No"
					>
						<a>驳回</a>
					</Popconfirm>
					<br />
					<Popconfirm
						title="解除申请"
						description="确认解除吗？"
						onConfirm={() => changeStatus(record.id, 'unbind')}
						okText="Yes"
						cancelText="No"
					>
						<a>解除</a>
					</Popconfirm>
					<br />
				</div>
			),
		},
	];

	const changePage = (pageIndex: number, pageSize: number) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	};

	const searchBooking = async (values: SearchBooking) => {
		const res = await getBookingList({
			...values,
			pageIndex,
			pageSize,
		});

		const { data, message } = res.data;
		if (res.status === 201 || res.status === 200) {
			setBookingSearchResult(
				data.list.map((item: BookingSearchResult) => {
					return {
						...item,
						key: item.id,
					};
				})
			);
			setTotal(data.total);
		} else {
			message.error(message || '系统繁忙，稍后再试');
		}
	};

	const changeStatus = async (id: BookingSearchResult['id'], operator: string) => {
		let action = null;
		switch(operator) {
			case 'apply':
				action = apply;
				break;
			case 'reject':
				action = reject;
				break;
			case 'unbind':
				action = unbind
				break;
			default:
				action = apply;
				break;
		}
		try {
			await action(id);
			message.success('操作成功！');
			setRefreshNum(refreshNum + 1);
		} catch(e: any) {
			console.log(e);
			message.error(e?.message || '系统繁忙，稍后再试')
		}
	}

	const [form] = useForm<SearchBooking>();

	useEffect(() => {
		const values = form.getFieldsValue();
		searchBooking(values);
	}, [pageIndex, pageSize, refreshNum]);

	return (
		<div id="bookingManage-container">
			<div className="bookingManage-form">
				<Form
					form={form}
					onFinish={searchBooking}
					name="search"
					layout="inline"
					colon={false}
				>
					<Form.Item
						label="预定人"
						name="username"
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="会议室名称"
						name="meetingRoomName"
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="预定开始日期"
						name="rangeStartTime"
					>
						<DatePicker showTime={true} />
					</Form.Item>

					<Form.Item
						label="预定结束日期"
						name="rangeEndTime"
					>
						<DatePicker showTime={true} />
					</Form.Item>

					<Form.Item
						label="位置"
						name="meetingRoomLocation"
					>
						<Input />
					</Form.Item>

					<Form.Item label=" ">
						<Button
							type="primary"
							htmlType="submit"
						>
							搜索预定申请
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className="bookingManage-table">
				<Table
					columns={columns}
					dataSource={bookingSearchResult}
					pagination={{
						current: pageIndex,
						pageSize: pageSize,
						total: total,
						onChange: changePage,
					}}
				/>
			</div>
		</div>
	);
}
