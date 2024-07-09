import { DatePicker, Form, Input, Modal, message } from 'antd';
import { MeetingRoomSearchResult } from './MeetingRoomList';
import { useForm } from 'antd/es/form/Form';
import { BookingSearchResult } from '../booking_history/BookingHistory';
import { useEffect } from 'react';
import { createBooking } from '../../api/interface';
import dayjs from 'dayjs';

interface modalProps {
	room: MeetingRoomSearchResult;
	cancelHandler: () => void;
	isOpen: boolean;
}

export type CreateBooking = {
	meetingRoomId: number;
	startTime: number;
	endTime: number;
	note: string;
};

export default function CreateBookingModal(props: modalProps) {
	const [form] = useForm();

	const okHandler = async () => {
		const value = form.getFieldsValue() as Omit<CreateBooking, 'id'>;
		const res = await createBooking({
			meetingRoomId: props.room.id,
			startTime: new Date(dayjs(value.startTime).toString()).getTime(),
			endTime: new Date(dayjs(value.endTime).toString()).getTime(),
			note: value.note,
		});
    
    const {status} = res;
    if (status === 200 || status === 201) {
      message.success('预定成功');
      props.cancelHandler();
    }
	};

	// 重新预定其他会议室时清空数据
	useEffect(() => {
		form.setFieldsValue({
			rangeStartTime: undefined,
			rangeEndTime: undefined,
		});
	}, [props.isOpen]);

	return (
		<Modal
			title="预约会议室"
			open={props.isOpen}
			onOk={okHandler}
			onCancel={props.cancelHandler}
		>
			<Form
				form={form}
				onFinish={okHandler}
				name="search"
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				colon={false}
				labelAlign="left"
			>
				<Form.Item label="会议室">
					<span>{props.room?.name}</span>
				</Form.Item>

				<Form.Item
					label="预定开始日期"
					name="startTime"
				>
					<DatePicker showTime={true} />
				</Form.Item>

				<Form.Item
					label="预定结束日期"
					name="endTime"
				>
					<DatePicker showTime={true} />
				</Form.Item>

				<Form.Item
					label="备注"
					name="note"
				>
					<Input />
				</Form.Item>
			</Form>
		</Modal>
	);
}
