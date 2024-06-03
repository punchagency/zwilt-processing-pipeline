import IORedis from 'ioredis';
import { RedisPubSub } from 'graphql-redis-subscriptions';

export const redisOptions = {
  // host: 'redis-19881.c10.us-east-1-4.ec2.cloud.redislabs.com',
  // port: 19881,
  // password: 'VYo19ByHE3dW9Ygg5QFV5d70RGZ0hMSf',

  //veyron-cred
  host: 'redis-19540.c281.us-east-1-2.ec2.cloud.redislabs.com',
  port: 19540,
  password: 'tTuyWhNUFsaYFYPAMV0nTNgs5qLTaMNk',
};

export const pubSub = new RedisPubSub({
  publisher: new IORedis(redisOptions),
  subscriber: new IORedis(redisOptions),
});
