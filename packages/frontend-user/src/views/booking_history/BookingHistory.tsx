import { Button, DatePicker, Form, Input, Popconfirm, Table, message } from 'antd';
import { useForm } from 'antd/es/form/Form';
import { useEffect, useState } from 'react';
import './BookingHistory.css';
import { getUserInfo } from '../../utils';
import { UserInfo, getBookingList, unbind } from '../../api/interface';
import { MeetingRoomSearchResult } from '../meeting_room_list/MeetingRoomList';
import { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

export interface SearchBooking {
	username: string;
	meetingRoomName: string;
	meetingRoomLocation: string;
	rangeStartTime: Date;
	rangeEndTime: Date;
}

export interface BookingSearchResult {
	id: number;
	startTime: Date;
	endTime: Date;
	status: number;
	note: string;
	user: UserInfo;
	room: MeetingRoomSearchResult;
	createTime: Date;
	updateTime: Date;
}

export enum BookingStatus {
	'申请中' = 0,
	'审批通过' = 1,
	'审批驳回' = 2,
	'已解除' = 3,
}

export function BookingHistory() {
	const [pageIndex, setPageIndex] = useState(1);
	const [pageSize, setPageSize] = useState(10);
	const [bookingList, setBookingList] = useState<BookingSearchResult[]>([]);
  const [refreshNum, setRefreshNum] = useState(0);

	const searchBooking = async () => {
		const res = await getBookingList({ ...form.getFieldsValue(), username: getUserInfo().username, pageIndex, pageSize });

		const {
			data: { data },
			status,
		} = res;

		if (status === 201 || status === 200) {
			setBookingList(
				(data.list as BookingSearchResult[]).map((item) => ({
					...item,
					key: item.id,
				}))
			);
		} else {
			message.error(data.message || '请求失败');
		}
	};

	const [form] = useForm();

	const changePage = (pageIndex: number, pageSize: number) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	};

	const unbindBooking = async (id: BookingSearchResult['id']) => {
    await unbind(id);
    setRefreshNum(refreshNum + 1);
  };

	const columns: ColumnsType<BookingSearchResult> = [
		{
			title: '会议室名称',
			dataIndex: 'room',
			render(_, record) {
				return record.room.name;
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
			render: (v) => {
				const { status } = v;
				return (
					<div>
						{status === BookingStatus['申请中'] ? (
							<Popconfirm
								title="解除申请"
								description="是否确认解除申请？"
								onConfirm={() => unbindBooking(v.id)}
							>
								<Button type="link">解除预定</Button>
							</Popconfirm>
						) : null}
					</div>
				);
			},
		},
	];

	useEffect(() => {
		searchBooking();
	}, [pageIndex, pageSize, refreshNum]);

	return (
		<div id="bookingHistory-container">
			<div className="bookingHistory-form">
				<Form
					form={form}
					onFinish={searchBooking}
					name="search"
					layout="inline"
					colon={false}
				>
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
						name="meetingRoomPosition"
					>
						<Input />
					</Form.Item>

					<Form.Item label=" ">
						<Button
							type="primary"
							htmlType="submit"
						>
							搜索预定历史
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className="bookingHistory-table">
				<Table
					columns={columns}
					dataSource={bookingList}
					pagination={{
						current: pageIndex,
						pageSize: pageSize,
						onChange: changePage,
					}}
				/>
			</div>
		</div>
	);
}
