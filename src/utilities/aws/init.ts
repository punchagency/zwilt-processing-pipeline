import {fromEnv} from '@aws-sdk/credential-providers'; // ES6 import
import {S3Client} from '@aws-sdk/client-s3';
// import { SNSClient } from '@aws-sdk/client-sns'

const globalConfig = {
  region: process.env.AWS_REGION ? process.env.AWS_REGION : 'eu-east-1',
  credentials: fromEnv(),
};

export const s3Client = new S3Client(globalConfig);
// const snsClient = new SNSClient(globalConfig);
