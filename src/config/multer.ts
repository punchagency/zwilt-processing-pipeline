import multer from 'multer';
import {Request} from 'express';

const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: {mimetype: string}, cb: any) => {
  if (file.mimetype.includes('image')) {
    cb(null, true);
  } else if (file.mimetype.includes('video')) {
    cb(null, true);
  } else {
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE'), false);
  }
};

export const multerUpload = multer({
  storage,
  fileFilter,
  limits: {fileSize: 1000000000, files: 10},
});
