import { redisClient } from './connection';
import { CachedPlayerData } from '../../types';

interface SearchResult {
  id: string;
  value: CachedPlayerData;
}

interface SearchResult {
  id: string;
  value: CachedPlayerData;
}

interface searchPlayersResponse {
  total: number;
  documents: SearchResult[];
}

export const deleteAllPlayers = async () => {
  try {
    const client = await redisClient;
    await client.ft.dropIndex('idx:players', {
      DD: true,
    });
    console.log('deleted all players');
    return true;
  } catch (error) {
    throw new Error("Couldn't delete all players");
  }
};

export const searchPlayers = async (queryString: string) => {
  const client = await redisClient;
  const players = (await client.ft.search('idx:players', queryString, {
    LIMIT: {
      from: 0,
      size: 100,
    },
    SORTBY: {
      BY: 'value',
      DIRECTION: 'DESC',
    },
  })) as unknown as searchPlayersResponse;

  //just return the values
  return players.documents.map((player) => player.value);
};

export const getAllPlayers = async () => {
  const client = await redisClient;
  console.log('getting all players');
  try {
    const players = (await client.ft.search('idx:players', '*', {
      LIMIT: {
        from: 0,
        size: 1000,
      },
      SORTBY: {
        BY: 'value',
        DIRECTION: 'DESC',
      },
    })) as unknown as searchPlayersResponse;
    console.dir(players, { depth: null });
    return players.documents.map((player) => player.value);
  } catch (error) {
    console;
  }
};
