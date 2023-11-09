import { redisClient } from './connection';
import { SchemaFieldTypes } from 'redis';

import { PlayerData, CachedPlayerData } from '../../types';
import { fantasyCalcApi } from '../externalApis';

export const getTradeValues = async (): Promise<CachedPlayerData[]> => {
  const { data }: { data: PlayerData[] } = await fantasyCalcApi;
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
  const client = await redisClient;
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
    // client.expire(`players:${player.name}`, 100);
  });

  try {
    const indexInfo = await client.ft.info('idx:players');
    console.log(indexInfo, 'index exists');
  } catch (error) {
    console.log('no index found... creating one...');
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
  }
};

export const getPlayerById = async (id: string): Promise<CachedPlayerData> => {
  console.log('getting player by id', id);
  const client = await redisClient;
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
};
