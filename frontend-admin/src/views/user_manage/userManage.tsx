import { Button, Form, Input, Table, message, Image } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { useCallback, useEffect, useState } from 'react';
import './userManage.css';
import { searchUsers } from '../../interface/interface';

export interface SearchUser {
	username: string;
	nickName: string;
}

interface UserSearchResult {
	username: string;
	nickName: string;
	email: string;
	headPic: string;
	createTime: Date;
}

const columns: ColumnsType<UserSearchResult> = [
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
				<img
					width={50}
					src={src}
					alt="avatar"
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
];

export function UserManage() {
	const [pageIndex, setPageIndex] = useState<number>(1);
	const [pageSize, setPageSize] = useState<number>(5);
	const [total, setTotal] = useState<number>(0);
	const [userList, setUserList] = useState<UserSearchResult[]>();
	const searchForm: SearchUser = {
		username: '',
		nickName: '',
	};

	// 搜索请求处理
	const dealSearch = async () => {
		const res = await searchUsers({ ...searchForm, pageIndex, pageSize });
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
		searchForm.username = values.username;
		searchForm.nickName = values.nickName;

		// 点击搜索后重置分页再进行搜索
		setPageIndex(1);
		dealSearch();
	};
	const changePage = useCallback((pageIndex: number, pageSize: number) => {
		setPageIndex(pageIndex);
		setPageSize(pageSize);
	}, []);

	useEffect(() => {
		dealSearch();
	}, [pageSize, pageIndex]);
	return (
		<div id="userManage-container">
			<div className="userManage-form">
				<Form
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