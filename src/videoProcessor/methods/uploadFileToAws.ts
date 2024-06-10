import {AWSS3Uploader} from '../../utilities/uploaders/s3';
import * as path from 'path';

export default async function uoloadFileToAws(
  filePath: string
) {
  try {
    const s3Uploader = new AWSS3Uploader();

    let videoFileUploadResult = {url: ''};

    if (filePath && filePath.length > 0) {
      videoFileUploadResult = await s3Uploader.uploadFile(
        filePath,
        path.basename(filePath),
        false
      );
    }

    return {fileUrl: '', videoUrl: videoFileUploadResult.url};
  } catch (error) {
    console.error('Error uploading to AWS:', error);
    throw new Error('Failed to upload to AWS');
  }
}
