import { RedisClientType, createClient } from 'redis';

export async function withRedisClient<T>(
  callback: (client: RedisClientType) => Promise<T>
): Promise<T> {
  console.log(
    'creating redis client',
    `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`
  );
  const redisClient: RedisClientType =
    process.env.NODE_ENV === 'production'
      ? createClient({
          url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
        })
      : createClient({
          url: `redis://${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
        });
  redisClient.connect();
  try {
    const client = await redisClient;
    return await callback(client);
  } finally {
    redisClient.quit();
  }
}
