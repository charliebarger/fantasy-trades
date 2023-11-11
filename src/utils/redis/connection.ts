import { RedisClientType, createClient } from 'redis';

export async function withRedisClient<T>(
  callback: (client: RedisClientType) => Promise<T>
): Promise<T> {
  const redisClient: RedisClientType =
    process.env.NODE_ENV === 'production'
      ? createClient({
          url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
        })
      : createClient({
          url: `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
        });
  redisClient.connect();
  // if (process.env.NODE_ENV === 'development') {
  //   redisClient.select(1);
  // }

  try {
    const client = await redisClient;
    return await callback(client);
  } finally {
    redisClient.quit();
  }
}
