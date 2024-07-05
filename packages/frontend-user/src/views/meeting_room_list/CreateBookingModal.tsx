import { DatePicker, Form, Input, Modal } from 'antd';
import { MeetingRoomSearchResult } from './MeetingRoomList';
import { useForm } from 'antd/es/form/Form';
import { BookingSearchResult } from '../booking_history/BookingHistory';
import { useEffect } from 'react';

interface modalProps {
	room: MeetingRoomSearchResult;
	cancelHandler: () => void;
	isOpen: boolean;
}

type CreateBooking = Pick<BookingSearchResult, 'id' | 'startTime' | 'endTime' | 'note'>;

export default function CreateBookingModal(props: modalProps) {
	const [form] = useForm();

	const createBooking = () => {
    const value = form.getFieldsValue() as CreateBooking;
    console.log(value)
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
			onOk={createBooking}
			onCancel={props.cancelHandler}
		>
			<Form
				form={form}
				onFinish={createBooking}
				name="search"
				labelCol={{ span: 6 }}
				wrapperCol={{ span: 18 }}
				colon={false}
				labelAlign="left"
			>
				<Form.Item label="会议室">
					<span>{props.room.name}</span>
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

				<Form.Item label="备注" name="note">
          <Input />
        </Form.Item>
			</Form>
		</Modal>
	);
}
