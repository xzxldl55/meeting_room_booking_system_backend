import { message } from 'antd';
import './head_pic_upload.css';
import Dragger, { DraggerProps } from 'antd/es/upload/Dragger';
import { InboxOutlined } from '@ant-design/icons';

interface HeadPicUploadProps {
	value?: string;
	onChange?: Function;
}

let onChange: HeadPicUploadProps['onChange'];

const draggerProps: DraggerProps = {
	name: 'file',
	action: 'http://localhost:9999/user/upload',
	onChange(info) {
		const { status } = info.file;
		if (status === 'done') {
			onChange?.(info.file.response.data);
			message.success(`${info.file.name} 文件上传成功`);
		} else if (status === 'error') {
			message.error(`${info.file.name} 文件上传失败`);
		}
	},
};

const dragger = (
	<Dragger {...draggerProps}>
		<p className="ant-upload-drag-icon">
			<InboxOutlined />
		</p>
		<p className="ant-upload-text">点击或拖拽文件来上传</p>
	</Dragger>
);

export function HeadPicUpload(props: HeadPicUploadProps) {
	onChange = props.onChange;
	return props?.value ? (
		<div className="head-pic-box">
			<img
				src={props.value.startsWith('http') ? props.value : 'http://localhost:9999/' + props.value}
				alt="avatar"
				width="100"
				height="100"
			/>
			{dragger}
		</div>
	) : (
		<div>{dragger}</div>
	);
}
