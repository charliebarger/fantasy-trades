import { CachedPlayerData } from '../../types';
import { withRedisClient } from './connection';
import { SchemaFieldTypes } from 'redis';
import { getTradeValues } from './tradeOperations';
import { PlayerId, PlayerWithValues } from '../../types';
import { createError } from '../utils';

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
  });
};

export const getAllPlayers = async () => {
  return withRedisClient(async (client) => {
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
    return players.documents.map((player) => player.value);
  });
};

export const updatePlayersTradeValues = async () => {
  return withRedisClient(async (client) => {
    try {
      const players = await getTradeValues();
      players.forEach(async (player: CachedPlayerData) => {
        client.json.set(
          `players:${player.name.split(' ').join('-')}`,
          '$',
          player as any,
          {
            NX: true,
          }
        );
      });
    } catch (error) {
      console.log("Couldn't update players");
    }
    try {
      const indexExists = await client.ft.info('idx:players');
      if (indexExists) {
        console.log('index exists');
        return;
      } else {
        throw new Error('no index found');
      }
    } catch (error) {
      console.log('no index found... creating one...');
      try {
        await client.ft.create(
          'idx:players',
          {
            '$.name': {
              type: SchemaFieldTypes.TEXT,
              AS: 'name',
              SORTABLE: true,
            },
            '$.position': {
              type: SchemaFieldTypes.TEXT,
              AS: 'position',
            },
            '$.espnId': {
              type: SchemaFieldTypes.TEXT,
              AS: 'espnId',
            },
            '$.value': {
              type: SchemaFieldTypes.NUMERIC,
              AS: 'value',
              SORTABLE: true,
            },
            '$.team': {
              type: SchemaFieldTypes.TEXT,
              AS: 'team',
            },
          },
          {
            ON: 'JSON',
            PREFIX: 'players:',
          }
        );
      } catch (error) {
        console.log(error, 'my error');
        console.log("Couldn't create index");
      }
    }
  });
};

export const getPlayerById = async (id: string): Promise<CachedPlayerData> => {
  console.log('getting player by id', id);
  return withRedisClient(async (client) => {
    const playerData = (await client.json.get(
      `players:${id}`
    )) as unknown as CachedPlayerData;
    if (playerData) {
      return {
        name: playerData.name,
        position: playerData.position,
        espnId: playerData.espnId,
        value: playerData.value,
        team: playerData.team,
      };
    }
    throw createError(404, 'Player not found');
  });
};

export const getPlayerData = async (
  playerArr: PlayerId[] | PlayerWithValues[],
  thisIsAFleece: boolean
): Promise<CachedPlayerData[]> => {
  const players = Promise.all(
    playerArr.map(async (player) => {
      const playerData = await getPlayerById(player.id);
      if (thisIsAFleece) {
        const playerWithValues = player as PlayerWithValues;
        return {
          ...playerData,
          value: playerWithValues.value || playerData.value,
        };
      } else {
        return playerData;
      }
    })
  );
  return players;
};

export const deleteAndUpdatePlayers = async () => {
  await deleteAllPlayers();
  updatePlayersTradeValues();
};
