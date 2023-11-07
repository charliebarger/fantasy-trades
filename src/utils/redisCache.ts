import { createClient } from 'redis';
import { SchemaFieldTypes, RediSearchSchema } from 'redis';
import { getTradeValues } from './redis/updatePlayersTradeValues';
import { CachedPlayerData } from '../types';

const redisClient = createClient({
  url: `redis://${process.env.REDIS_USERNAME}:${process.env.REDIS_PASSWORD}@${process.env.REDIS_URL}:${process.env.REDIS_PORT}`,
}).connect();

const xc = 10;

const getOrsetPlayers = async (searchValue: string) => {
  const client = await redisClient;
};

const getOrSetCache = async (key: string, cb: () => any) => {
  const client = await redisClient;

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
    const result = await getTradeValues();
    result.forEach((player: CachedPlayerData) => {
      client.json.set(`${key}:${player.name}`, '.', JSON.stringify(player), {
        NX: true,
      });
      client.expire(`${key}:${player.name}`, 10);
    });
    console.log('done');
    //check if index exists
    try {
      const indexExists = await client.ft.info('idx:players');
      console.log(indexExists, 'index exists');
    } catch (error) {
      console.log(error, 'no index found... creating one...');
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
    }

    return result;
  } catch (error) {
    console.log('error' + error);
    console.log(error);
  }
};

export const getOrSetCacheForPlayer = async (key: string, cb: () => any) => {
  const client = await redisClient;

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
    await client.ft.create(
      `idx:${key}`,
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
        PREFIX: `${key}:`,
      }
    );
    client.expire(key, xc);
    return result;
  } catch (error) {
    console.log(error);
  }
};

export const searchPlayers = async (key: string, searchString: string) => {
  const client = await redisClient;
  const searchResults = await client.ft.search(`idx:${key}`, searchString);
  return searchResults;
};

export default getOrSetCache;
