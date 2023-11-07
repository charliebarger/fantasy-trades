import { redisClient } from './connection';
import { SchemaFieldTypes } from 'redis';
import { fantasyCalcApi } from '../externalApis';

import { PlayerData, CachedPlayerData } from '../../types';

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
};
