import * as multer from 'multer';
import * as fs from 'fs';

// 自定义文件保存
export const storage = multer.diskStorage({
  // 指定保存目录
  destination: (req, file, cb) => {
    try {
      fs.mkdirSync('uploads');
    } catch (e) {}

    cb(null, 'uploads');
  },
  // 指定保存文件名
  filename: (req, file, cb) => {
    const uniqueSuffix =
      Date.now() +
      '-' +
      Math.round(Math.random() * 1e9) +
      '-' +
      file.originalname;
    cb(null, uniqueSuffix);
  },
});
