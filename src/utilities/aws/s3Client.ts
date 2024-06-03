import {
  ListObjectsV2Command,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2CommandInput,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import {s3Client} from './init';

/**
 * Lists objects in an S3 bucket.
 * @param {Object} bucketParams - Parameters for listing objects in the bucket.
 * @returns {Promise} A promise that resolves to the response of the list operation.
 */
export const s3ClientListObjects = async (
  bucketParams: ListObjectsV2CommandInput
) => {
  return await s3Client.send(new ListObjectsV2Command(bucketParams));
};

/**
 * Deletes an object from an S3 bucket.
 * @param {Object} bucketParams - Parameters for the target bucket.
 * @param {string} key - The key of the object to be deleted.
 * @returns {Promise} A promise that resolves to the response of the delete operation.
 */
export const s3ClientDeleteObject = async (
  bucketParams: {Bucket: any},
  key: any
) => {
  return await s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketParams.Bucket,
      Key: key,
    })
  );
};

/**
 * Retrieves an object from an S3 bucket.
 * @param {Object} bucketParams - Parameters for the target bucket.
 * @param {string} key - The key of the object to be retrieved.
 * @returns {Promise} A promise that resolves to the response of the get operation.
 */
export const s3ClientGetObject = async (
  bucketParams: {Bucket: any},
  key: any
) => {
  return await s3Client.send(
    new GetObjectCommand({
      Bucket: bucketParams.Bucket,
      Key: key,
    })
  );
};

/**
 * Uploads an object to an S3 bucket.
 * @param {Object} bucketParams - Parameters for the target bucket.
//  * @param {string} key - The key under which to store the new object.
//  * @param {ReadableStream} fileStream - Readable stream representing the content of the object.
 * @returns {Promise} A promise that resolves to the response of the put operation.
 */
export const s3ClientPutObject = async (
  bucketParams: PutObjectCommandInput
) => {
  return await s3Client.send(
    new PutObjectCommand({
      ...bucketParams,
    })
  );
};
