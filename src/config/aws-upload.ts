import {s3ClientPutObject} from '../utilities/aws/s3Client';
import {uuid} from 'uuidv4';

export const s3Upload = async (
  fileInput: Express.Multer.File | Express.Multer.File[],
  folderName: string,
  fileName: string
) => {
  if (Array.isArray(fileInput)) {
    const fileType = fileInput[0].mimetype.split('/')[0];
    const params = fileInput.map(file => {
      return {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `${folderName}/${fileType}/${fileName}/${uuid()}`,
        Body: file.buffer,
        ContentType: `${file.mimetype}`,
      } as any;
    });
    return await Promise.all(params.map(param => s3ClientPutObject(param)));
  } else {
    const fileType = fileInput.mimetype.split('/')[0];
    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: `${folderName}/${fileType}/${fileName}/${uuid()}`,
      Body: fileInput.buffer,
      ContentType: `${fileInput.mimetype}`,
    } as any;

    return await s3ClientPutObject(params);
  }
};
