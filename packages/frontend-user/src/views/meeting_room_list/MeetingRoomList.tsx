import { Badge, Button, Form, Input, Popconfirm, Table, message } from 'antd';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './meeting_room_list.css';
import { ColumnsType } from 'antd/es/table';
import { useForm } from 'antd/es/form/Form';
import { searchMeetingRoomList } from '../../api/interface';
import CreateBookingModal from './CreateBookingModal';

export interface SearchMeetingRoom {
	name: string;
	capacity: number;
	equipment: string;
	location: string;
}

export interface MeetingRoomSearchResult {
	id: number;
	name: string;
	capacity: number;
	location: string;
	equipment: string;
	description: string;
	isBooked: boolean;
	createTime: Date;
	updateTime: Date;
}

export function MeetingRoomList() {
	const [pageIndex, setPageIndex] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [isOpen, setIsOpen] = useState(false);
	const [currentBookingRoom, setCurrentBookingRoom] = useState<MeetingRoomSearchResult>();
	const [meetingRoomResult, setMeetingRoomResult] = useState<Array<MeetingRoomSearchResult>>([]);

	const openModal = (room: MeetingRoomSearchResult) => {
		setCurrentBookingRoom(room);
		setIsOpen(true);
	};

	const columns: ColumnsType<MeetingRoomSearchResult> = useMemo(
		() => [
			{
				title: '名称',
				dataIndex: 'name',
			},
			{
				title: '容纳人数',
				dataIndex: 'capacity',
			},
			{
				title: '位置',
				dataIndex: 'location',
			},
			{
				title: '设备',
				dataIndex: 'equipment',
			},
			{
				title: '描述',
				dataIndex: 'description',
			},
			{
				title: '添加时间',
				dataIndex: 'createTime',
			},
			{
				title: '上次更新时间',
				dataIndex: 'updateTime',
			},
			{
				title: '预定状态',
				dataIndex: 'isBooked',
				render: (_, record) => (record.isBooked ? <Badge status="error">已被预订</Badge> : <Badge status="success">可预定</Badge>),
			},
			{
				title: '操作',
				render: (v) => (
					<Button
						type="link"
						onClick={() => openModal(v)}
					>
						预定
					</Button>
				),
			},
		],
		[]
	);

	const searchMeetingRoom = useCallback(async ({ name, capacity, equipment, location }: SearchMeetingRoom) => {
		const res = await searchMeetingRoomList({
			name,
			capacity,
			equipment,
			location,
			pageIndex,
			pageSize,
		});

		const { data } = res.data;
		if (res.status === 201 || res.status === 200) {
			setMeetingRoomResult(
				data.list.map((item: MeetingRoomSearchResult) => {
					return {
						key: item.id,
						...item,
					};
				})
			);
		} else {
			message.error(data || '系统繁忙，请稍后再试');
		}
	}, []);

	const [form] = useForm();

	useEffect(() => {
		searchMeetingRoom({
			name: form.getFieldValue('name'),
			capacity: form.getFieldValue('capacity'),
			equipment: form.getFieldValue('equipment'),
			location: form.getFieldValue('location'),
		});
	}, [pageIndex, pageSize]);

	const changePage = useCallback(function (pageIndex: number, pageSize: number) {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	}, []);

	return (
		<div id="meetingRoomList-container">
			<div className="meetingRoomList-form">
				<Form
					form={form}
					onFinish={searchMeetingRoom}
					name="search"
					layout="inline"
					colon={false}
				>
					<Form.Item
						label="会议室名称"
						name="name"
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="容纳人数"
						name="capacity"
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="设备"
						name="equipment"
					>
						<Input />
					</Form.Item>

					<Form.Item
						label="位置"
						name="location"
					>
						<Input />
					</Form.Item>

					<Form.Item label=" ">
						<Button
							type="primary"
							htmlType="submit"
						>
							搜索会议室
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className="meetingRoomList-table">
				<Table
					columns={columns}
					dataSource={meetingRoomResult}
					pagination={{
						current: pageIndex,
						pageSize: pageSize,
						onChange: changePage,
					}}
				/>
			</div>
			<CreateBookingModal
				isOpen={isOpen}
				room={currentBookingRoom as MeetingRoomSearchResult}
				cancelHandler={() => {
					setIsOpen(false);
				}}
			/>
		</div>
	);
}
