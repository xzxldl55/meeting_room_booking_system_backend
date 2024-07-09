import { Button, DatePicker, Form, Tabs, TabsProps, TimeRangePickerProps, message } from 'antd';
import './statistics.css';
import { useEffect, useRef, useState } from 'react';
import { getMeetingRoomStatistics, getUserStatistics } from '../../interface/interface';
import { useForm } from 'antd/es/form/Form';
import dayjs, { Dayjs } from 'dayjs';
import * as echarts from 'echarts';

const { RangePicker } = DatePicker;

type RangeStartTime = [Dayjs, Dayjs];

interface StatisticsData {
	id: number;
	name: string;
	count: number;
}

function SearchForm({ onSearch }: { onSearch: (...args: any[]) => void }) {
	const [form] = useForm();

	const search = (values: { rangeStartTime: RangeStartTime }) => {
		form.validateFields().then(() => onSearch(values.rangeStartTime[0], values.rangeStartTime[1]));
	};

  // Antd 的 RangePicker 组件存在 bug，当存在默认属性时，再次点击组件修改时间区间会报错 clone.weekly is not a function（dayjs 版本与内部引用版本冲突？）
	// const rangePresets: TimeRangePickerProps['presets'] = [
	// 	{ label: '近一周', value: [dayjs().add(-7, 'd'), dayjs()] },
	// 	{ label: '近两周', value: [dayjs().add(-14, 'd'), dayjs()] },
	// 	{ label: '近一月', value: [dayjs().add(-30, 'd'), dayjs()] },
	// 	{ label: '近三月', value: [dayjs().add(-90, 'd'), dayjs()] },
	// ];
	return (
		<Form
			onFinish={search}
			name={Date.now() + ''}
			layout="inline"
			colon={false}
		>
			<Form.Item
				label="预定开始日期"
				name="rangeStartTime"
				rules={[{ required: true, message: '请选择预定开始日期' }]}
			>
				<RangePicker />
			</Form.Item>

			<Form.Item label=" ">
				<Button
					type="primary"
					htmlType="submit"
				>
					统计
				</Button>
			</Form.Item>
		</Form>
	);
}

export function Statistics() {
	const [tabIndex, setTabIndex] = useState('1');
	const [data, setData] = useState<StatisticsData[]>();
	const chartRef = useRef(null);

	const onSearch = async (rangeStart: Dayjs, rangeEnd: Dayjs) => {
		const api = tabIndex === '1' ? getUserStatistics : getMeetingRoomStatistics;
		const res = await api(rangeStart.format('YYYY-MM-DD HH:mm:ss'), rangeEnd.format('YYYY-MM-DD HH:mm:ss'));

		const {
			status,
			data: { data },
		} = res;

		if (status === 200 || status === 201) {
			setData(data);
		} else {
			message.error('查询失败');
		}
	};

	const onTabChange = (key: string) => {
		setTabIndex(key);
	};

	const items: TabsProps['items'] = [
		{
			key: '1',
			label: `用户使用统计`,
			children: (
				<>
					<SearchForm onSearch={onSearch} />
				</>
			),
		},
		{
			key: '2',
			label: `会议室使用统计`,
			children: (
				<>
					<SearchForm onSearch={onSearch} />
				</>
			),
		},
	];

	useEffect(() => {
		const chart = echarts.init(chartRef.current);
		chart.setOption({
			title: {
				text: tabIndex === '1' ? '用户使用统计' : '会议室使用统计',
				left: 'center',
			},
			tooltip: {
				trigger: 'item',
			},
			legend: {
				orient: 'vertical',
				left: 'left',
			},
			xAxis: data?.map((v) => v.name),
			series: [
				{
					name: '预定次数',
					type: 'pie',
					radius: '50%',
					data: data?.map((item) => ({ name: item.name, value: item.count })) || [],
				},
			],
		});
	}, [data]);

	return (
		<div className="statistics-container">
			<Tabs
				defaultActiveKey="1"
				items={items}
				onChange={onTabChange}
			/>
			<div
				ref={chartRef}
				className="chart-container"
			></div>
		</div>
	);
}
