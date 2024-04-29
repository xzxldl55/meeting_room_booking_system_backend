import './meetingRoomManage.css';
import { Badge, Form, Button, Input, message, Popconfirm, InputNumber } from 'antd';
import { useForm } from 'antd/es/form/Form';
import Table, { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { deleteMeetingRoom, getMeetingRoomList } from '../../interface/interface';
import { CreateMeetingRoomModal } from './createMeetingRoomModal';
import { UpdateMeetingRoomModal } from './updateMeetingRoomModal';

export interface SearchMeetingRoom {
	name: string;
	capacity: number;
	equipment: string;
}

interface MeetingRoom {
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

export function MeetingRoomManage() {
	const [pageIndex, setPageIndex] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [meetingRoomList, setMeetingRoomList] = useState<MeetingRoom[]>([]);
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [searchRandomNum, setSearchRandomNum] = useState<number>(0);
	const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
	const [updateId, setUpdateId] = useState<number>();

	const handleDelete = useCallback(async (id: number) => {
		try {
			await deleteMeetingRoom(id);
			message.success('删除成功');
			setSearchRandomNum(Math.random());
		} catch (e) {}
	}, []);

	const columns: ColumnsType<MeetingRoom> = useMemo(
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
				render: (_, record) => new Date(record.createTime).toLocaleString(),
			},
			{
				title: '上次更新时间',
				dataIndex: 'updateTime',
				render: (_, record) => new Date(record.updateTime).toLocaleString(),
			},
			{
				title: '预定状态',
				dataIndex: 'isBooked',
				render: (_, record) =>
					record.isBooked ? (
						<Badge
							status="error"
							text="已被预订"
						></Badge>
					) : (
						<Badge
							status="success"
							text="可预定"
						></Badge>
					),
			},
			{
				title: '操作',
				render: (_, record) => (
					<div>
						<Popconfirm
							title="会议室删除"
							description="确认删除吗？"
							onConfirm={() => handleDelete(record.id)}
							okText="Yes"
							cancelText="No"
						>
							<a href="javascript:void(0)">删除</a>
						</Popconfirm>
						<a
							href="javascript:void(0)"
							onClick={() => {
								setIsUpdateModalOpen(true);
								setUpdateId(record.id);
							}}
							style={{ marginLeft: 4 }}
						>
							更新
						</a>
					</div>
				),
			},
		],
		[]
	);

	const searchMeetingRoom = useCallback(async (values: SearchMeetingRoom) => {
		const res = await getMeetingRoomList({
			...values,
			pageIndex,
			pageSize,
		});

		const {
			data: {
				code,
				data: { list },
			},
		} = res;

		if (code === 200 || code === 201) {
			setMeetingRoomList(
				list.map((v: MeetingRoom) => ({
					...v,
					key: v.id,
				}))
			);
		}
	}, []);

	const [form] = useForm();

	useEffect(() => {
		searchMeetingRoom(form.getFieldsValue());
	}, [pageIndex, pageSize, searchRandomNum]);

	const changePage = useCallback((pageIndex: number, pageSize: number) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	}, []);

	return (
		<div id="meetingRoomManage-container">
			<div className="meetingRoomManage-form">
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
						<InputNumber />
					</Form.Item>

					<Form.Item
						label="设备"
						name="equipment"
					>
						<Input />
					</Form.Item>

					<Form.Item>
						<Button
							type="primary"
							htmlType="submit"
						>
							搜索会议室
						</Button>
					</Form.Item>
					<Form.Item>
						<Button
							type="primary"
							style={{ background: 'green' }}
							onClick={() => setIsCreateModalOpen(true)}
						>
							添加会议室
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className="meetingRoomManage-table">
				<Table
					columns={columns}
					dataSource={meetingRoomList}
					pagination={{
						current: pageIndex,
						pageSize: pageSize,
						onChange: changePage,
					}}
				/>
			</div>
			<CreateMeetingRoomModal
				isOpen={isCreateModalOpen}
				handleClose={() => {
					setIsCreateModalOpen(false);
					setSearchRandomNum(Math.random());
				}}
			></CreateMeetingRoomModal>
			<UpdateMeetingRoomModal
				id={updateId!}
				isOpen={isUpdateModalOpen}
				handleClose={() => {
					setIsUpdateModalOpen(false);
					setSearchRandomNum(Math.random());
				}}
			></UpdateMeetingRoomModal>
		</div>
	);
}
