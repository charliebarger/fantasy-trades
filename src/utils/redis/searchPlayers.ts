import { CachedPlayerData } from '../../types';
import { withRedisClient } from './connection';
import { updatePlayersTradeValues } from './updatePlayersTradeValues';

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
  return withRedisClient(async (client) => {
    try {
      //if index exists, delete it
      try {
        const indexInfo = await client.ft.info('idx:players');
        console.log(indexInfo, 'index exists');
        await client.ft.dropIndex('idx:players', {
          DD: true,
        });
      } catch (error) {
        console.log('no index ');
      }
      return true;
    } catch (error) {
      console.log(error);
      throw new Error("Couldn't delete all players");
    }
  });
};

export const searchPlayers = async (queryString: string) => {
  return withRedisClient(async (client) => {
    try {
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
      return players.documents.map((player) => player.value);
    } catch (error) {
      console.log("Couldn't search for players");
    }
  });
};

export const getAllPlayers = async () => {
  return withRedisClient(async (client) => {
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
      console.log("Couldn't get all players");
    }
  });
};
