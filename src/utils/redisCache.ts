import { createClient } from 'redis';
import { SchemaFieldTypes, RediSearchSchema } from 'redis';
import { CachedPlayerData } from '../controllers/players';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
}).connect();

const xc = 10;

const getOrSetCache = async (key: string, cb: () => any) => {
  const client = await redisClient;

  //put an index on player name

  try {
    const value = await client.json.get(key);
    if (value) {
      console.log('cache hit');
      if (typeof value === 'string') {
        const myValue = JSON.parse(value);
        return myValue;
      }
    }
    console.log('cache miss');
    const result = await cb();
    client.json.set(key, '.', JSON.stringify(result), {
      NX: true,
    });
    client.expire(key, xc);
    return result;
  } catch (error) {
    console.log(error);
  }
};

const searchPlayers = async () => {
  const client = await redisClient;
  await client.ft.create(
    'idx:players',
    {
      '$.name': {
        type: SchemaFieldTypes.TEXT,
      },
      '$.position': {
        type: SchemaFieldTypes.TEXT,
      },
    },
    {
      ON: 'JSON',
      PREFIX: 'players:',
    }
  );
};

export default getOrSetCache;
