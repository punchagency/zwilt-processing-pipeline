import { Service } from 'typedi';
import RedisClient from 'ioredis';

@Service()
export class RedisService {
    private readonly redisClient: RedisClient;

    constructor() {
        this.redisClient = new RedisClient({
        host: 'redis-19540.c281.us-east-1-2.ec2.cloud.redislabs.com',
        port: 19540,
        password: 'tTuyWhNUFsaYFYPAMV0nTNgs5qLTaMNk',
        });

        this.redisClient.on('error', (error: any) => {
            console.error('Redis connection error:', error);
        });
    }

    async publishEvent(channel: string, payload: any) {
        try {
            await this.redisClient.publish(channel, JSON.stringify(payload));
            console.log('Event published successfully');
        } catch (error) {
            console.error('Error publishing event:', error);
        }
    }
    

    async subscribeToChannel(channel: string, callback: (message: any) => void) {
        await this.redisClient.subscribe(channel);
        this.redisClient.on('message', (ch: any, message: any) => {
            if (ch === channel) {
                callback(JSON.parse(message));
            }
        });
    }
}
