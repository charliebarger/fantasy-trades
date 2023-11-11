import { SchemaFieldTypes } from 'redis';
import { withRedisClient } from './connection';
import { PlayerData, CachedPlayerData } from '../../types';
import { fantasyCalcApi, getFantasyCalcData } from '../externalApis';
import { deleteAllPlayers } from './searchPlayers';

export const getTradeValues = async (): Promise<CachedPlayerData[]> => {
  const { data }: { data: PlayerData[] } = await getFantasyCalcData();
  const players = data.map(
    (playerInfo: PlayerData): CachedPlayerData => ({
      name: playerInfo.player.name,
      position: playerInfo.player.position,
      espnId: playerInfo.player.espnId,
      value: Math.round(playerInfo.value / 100),
      team: playerInfo.player.maybeTeam,
    })
  );
  return players;
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

    console.log(playerData, 'player data');

    if (playerData) {
      return {
        name: playerData.name,
        position: playerData.position,
        espnId: playerData.espnId,
        value: playerData.value,
        team: playerData.team,
      };
    }
    throw new Error('Player not found');
  });
};

export const deleteAndUpdatePlayers = async () => {
  await deleteAllPlayers();
  updatePlayersTradeValues();
};
