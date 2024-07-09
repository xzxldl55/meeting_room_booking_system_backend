import { Button, Form, Input, Table, message, Image, Tag } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import './userManage.css';
import { freezeUser, searchUsers } from '../../interface/interface';
import { useForm } from 'antd/es/form/Form';

export interface SearchUser {
	username: string;
	nickName: string;
}

export interface UserSearchResult {
	id: string;
	username: string;
	nickName: string;
	email: string;
	headPic: string;
	isFrozen: boolean;
	createTime: Date;
}

export function UserManage() {
	const [pageIndex, setPageIndex] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(10);
	const [total, setTotal] = useState<number>(0);
	const [userList, setUserList] = useState<UserSearchResult[]>();
	const [refreshNum, setRefreshNum] = useState<number>(0);
	const [form] = useForm();

	// 搜索请求处理
	const dealSearch = async () => {
		const res = await searchUsers({ username: form.getFieldValue('username'), nickName: form.getFieldValue('nickName'), pageIndex, pageSize });
		const { data } = res.data;
		if (res.status === 201 || res.status === 200) {
			setUserList(
				data.list.map((item: UserSearchResult) => {
					return {
						key: item.username,
						...item,
					};
				})
			);
			setTotal(data.total || 0);
		} else {
			message.error(data || '系统繁忙，请稍后再试');
		}
	};

	// 点击搜索按钮
	const handleClickSearch = async (values: SearchUser) => {
		// 点击搜索后重置分页再进行搜索
		setPageIndex(1);
		dealSearch();
	};
	const changePage = useCallback((pageIndex: number, pageSize: number) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	}, []);

	const freeze = useCallback(async (id: string) => {
		const res = await freezeUser(id);

		const { data } = res.data;
		if (res.status === 200 || res.status === 201) {
			message.success('冻结成功');
			setRefreshNum(Math.random()); // 刷新表格
		} else {
			message.error(data.message || '冻结失败');
		}
	}, []);

	const columns: ColumnsType<UserSearchResult> = useMemo(
		() => [
			{
				title: '用户名',
				dataIndex: 'username',
			},
			{
				title: '头像',
				dataIndex: 'headPic',
				render: (value: string) => {
					const src = value?.startsWith('http') ? value : `http://localhost:9999/${value}`;
					return value ? (
						<Image
							width={50}
							src={src}
						/>
					) : (
						<span>-</span>
					);
				},
			},
			{
				title: '昵称',
				dataIndex: 'nickName',
			},
			{
				title: '邮箱',
				dataIndex: 'email',
			},
			{
				title: '注册时间',
				dataIndex: 'createTime',
			},
			{
				title: '状态',
				render: (_, record: UserSearchResult) => {
					return record.isFrozen ? <Tag color="blue">已冻结</Tag> : '';
				},
			},
			{
				title: '操作',
				render: (_, record: UserSearchResult) => {
					return (
						<a
							href="#"
							onClick={() => freeze(record.id)}
						>
							冻结
						</a>
					);
				},
			},
		],
		[]
	);

	useEffect(() => {
		dealSearch();
	}, [pageSize, pageIndex, refreshNum]);

	return (
		<div id="userManage-container">
			<div className="userManage-form">
				<Form
					form={form}
					onFinish={handleClickSearch}
					name="search"
					layout="inline"
					colon={false}
				>
					<Form.Item
						label="用户名"
						name="username"
					>
						<Input />
					</Form.Item>
					<Form.Item
						label="昵称"
						name="nickName"
					>
						<Input />
					</Form.Item>
					<Form.Item label=" ">
						<Button
							type="primary"
							htmlType="submit"
						>
							搜索用户
						</Button>
					</Form.Item>
				</Form>
			</div>
			<div className="userManage-table">
				<Table
					columns={columns}
					dataSource={userList}
					pagination={{ pageSize, current: pageIndex, total, onChange: changePage }}
				/>
			</div>
		</div>
	);
}
