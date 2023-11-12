import { Trade } from '../../types';
import { withRedisClient } from './connection';
import { PlayerData, CachedPlayerData } from '../../types';
import { getFantasyCalcData } from '../externalApis';

export const saveTrade = async (trade: Trade) => {
  return withRedisClient(async (client) => {
    const save = await client.json.set(
      `trades:${trade.id}`,
      '.',
      JSON.stringify(trade),
      {
        NX: true,
      }
    );
    client.expire(`trades:${trade.id}`, 604800);
    if (!save) {
      throw new Error();
    }
    return save;
    //trade expires in 7 days
  });
};

export const getTrade = async (id: string): Promise<Trade | undefined> => {
  return withRedisClient(async (client) => {
    const trade = await client.json.get(`trades:${id}`);
    if (trade) {
      return JSON.parse(trade as string) as Trade;
    }
    return undefined;
  });
};

export const deleteAllTrades = async () => {
  withRedisClient(async (client) => {
    //delete all redis keys that start with trade
    const keys = await client.keys('trades:*');
    if (keys.length === 0) {
      return;
    }
    await client.del(keys);
  });
};

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
