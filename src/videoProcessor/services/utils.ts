import fs from 'fs-extra';
import path from 'path';
import {CONSTANTS} from '../../utilities/constants';
import {s3ClientPutObject} from '../../utilities/aws/s3Client';

export function filterUrl(url: string) {
  url = url.substring(url.indexOf('.com/') + 5);
  return url;
}

export function changeFileExtension(filename: string, newExtension: string) {
  const currentExtension = path.extname(filename);
  const baseName = path.basename(filename, currentExtension);
  return `${baseName}${newExtension}`;
}

export function moveFile(source: any, destination: any) {
  return new Promise((resolve, reject) => {
    fs.rename(source, path.join(destination, path.basename(source)), err => {
      if (err) {
        reject(err);
      } else {
        resolve('success');
      }
    });
  });
}

export const deleteFile = async (filePath: string) => {
  try {
    await fs.promises.stat(filePath);
    await fs.promises.unlink(filePath);
    console.log('file deleted successfully');
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
};

export function deleteFilesInDirectory(directoryPath: string) {
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }

    files.forEach(file => {
      const filePath = path.join(directoryPath, file);

      fs.unlink(filePath, deleteError => {
        if (deleteError) {
          console.error('Error deleting file:', deleteError);
        } else {
          console.log('Deleted file:', filePath);
        }
      });
    });
  });
}

export const deleteFileInProcess = async (
  processingPath: string,
  toBeCalled?: any
) => {
  // const processingDir = path.join(scriptDirectory, ProcessingPath);

  if (!fs.existsSync(processingPath)) {
    // console.log('PROCESSING PATH', ProcessingPath);
    try {
      fs.mkdirpSync(processingPath);
      return;
    } catch (err) {
      return;
    }
  }
  fs.readdir(processingPath, async (err, files) => {
    if (err) {
      console.error('Error reading the processing folder:', err);
    } else {
      files.forEach(file => {
        const filePath = path.join(CONSTANTS.PROCESSING_FOLDER, file);
        fs.unlink(filePath, deleteError => {
          if (deleteError) {
            console.error(`Error deleting file ${file}:`, deleteError);
          } else {
            console.log(`Deleted file: ${file}`);
          }
        });
      });
      toBeCalled && toBeCalled();
    }
  });
};

export async function uploadFileToAWS(filePath: string, bucketName: string) {
  const bucketPath = path.basename(filePath);
  const params = {
    Bucket: bucketName,
    Key: bucketPath,
    Body: fs.readFileSync(filePath),
    ContentType: 'video/mp4',
  };
  return await s3ClientPutObject(params);
}
