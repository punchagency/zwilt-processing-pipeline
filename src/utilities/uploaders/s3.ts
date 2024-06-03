import {awsconfig} from './../../config/aws-config';
import {ApolloServerFileUploads} from './index';
import fs from 'fs';
import {s3ClientPutObject} from '../../utilities/aws/s3Client';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

type S3UploadConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  region?: string;
  destinationBucketName: string;
};

type S3UploadStream = {
  promise: Promise<any>;
};

export class AWSS3Uploader implements ApolloServerFileUploads.IUploader {
  private s3: S3Client;
  public config: S3UploadConfig;

  constructor() {
    this.config = {
      region: process.env.AWS_REGION as string,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      destinationBucketName: process.env.AWS_BUCKET_NAME as string,
    };

    this.s3 = new S3Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });
  }

  private createUploadStream(
    Key: string,
    fileStream: any,
    tags: any[]
  ): S3UploadStream {
    return {
      promise: s3ClientPutObject({
        Bucket: awsconfig.bucketName,
        Key,
        Body: fileStream,
        Tagging: tags
          .map(
            tag =>
              `${encodeURIComponent(tag.Key)}=${encodeURIComponent(tag.Value)}`
          )
          .join('&'),
      }),
    };
  }
  private createDestinationFilePath(filename: string): string {
    const queHoraEs = Date.now();
    const regex = /[\s_-]/gi;
    const fileTemp = filename.replace(regex, '.');
    const arrTemp = [fileTemp.split('.')];
    return `${arrTemp[0]
      .slice(0, arrTemp[0].length - 1)
      .join('_')}${queHoraEs}.${arrTemp[0].pop()}`;
  }

  async singleFileUpload(
    {
      file,
      directory = '',
      tags,
    }: {
      file: ApolloServerFileUploads.File;
      directory?: string;
      tags: any[];
    } // Optional parameter for specifying directory
  ): Promise<ApolloServerFileUploads.UploadedFileResponse> {
    const {createReadStream, filename, mimetype, encoding} = file;

    const fileStream = createReadStream();

    const filePath = this.createDestinationFilePath(filename);

    const fullFilePath = directory ? `${directory}/${filePath}` : filePath; // Include directory if provided

    const uploadStream = this.createUploadStream(
      fullFilePath,
      fileStream,
      tags
    );

    const result = await uploadStream.promise;

    return {filename, mimetype, encoding, url: result.Location};
  }

  async uploadFile(
    path: string,
    fileName: string,
    useFilePath?: boolean
  ): Promise<ApolloServerFileUploads.UploadFileResponse> {
    const fileStream = fs.createReadStream(path);

    const sanitizedFileName = encodeURIComponent(fileName.replace(/\s/g, '_'));

    const filePath = this.createDestinationFilePath(path);
    const uploadStream = this.createUploadStream(
      useFilePath ? filePath : sanitizedFileName,
      fileStream,
      []
    );

    await uploadStream.promise;
    const url = `https://${awsconfig.bucketName}.s3.amazonaws.com/${sanitizedFileName}`;
    
    return {url: useFilePath ? filePath : url};
  }

  async multipleUploads({
    files,
  }: {
    files: ApolloServerFileUploads.File[];
  }): Promise<ApolloServerFileUploads.UploadedFileResponse[]> {
    return Promise.all(
      files.map(f => this.singleFileUpload({file: f, tags: []}))
    );
  }

  async uploadFileToS3(localFilePath: string, s3Key: string): Promise<string> {
    const fileStream = fs.createReadStream(localFilePath);
    const command = new PutObjectCommand({
      Bucket: this.config.destinationBucketName,
      Key: s3Key,
      Body: fileStream,
    });

    try {
      await this.s3.send(command);
      // Return the URL of the uploaded file
      return `https://${this.config.destinationBucketName}.s3.amazonaws.com/${s3Key}`;
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      throw error;
    }
  }
}
