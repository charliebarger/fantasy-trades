import { withRedisClient } from './connection';

export interface PlayerId {
  id: string;
}

export interface PlayerWithValues extends PlayerId {
  value: number;
}

export type Trade =
  | {
      id: string;
      fleece: false;
      teamA: PlayerId[];
      teamB: PlayerId[];
    }
  | {
      id: string;
      fleece: true;
      teamA: PlayerWithValues[];
      teamB: PlayerWithValues[];
    };

export const saveTrade = async (trade: Trade) => {
  return withRedisClient(async (client) => {
    try {
      client.json.set(`trades:${trade.id}`, '.', JSON.stringify(trade), {
        NX: true,
      });
      //trade expires in 7 days
      client.expire(`trades:${trade.id}`, 604800);
      console.log('Trade saved');
    } catch (error) {
      console.log(error);
    }
  });
};

export const getTrade = async (id: string): Promise<Trade | undefined> => {
  return withRedisClient(async (client) => {
    try {
      const trade = await client.json.get(`trades:${id}`);
      if (trade) {
        return JSON.parse(trade as string) as Trade;
      }
      throw new Error('Trade not found');
    } catch (error) {
      console.log(error);
    }
  });
};
