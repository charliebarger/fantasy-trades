import { redisClient } from './connection';

interface PlayerData {
  id: string;
  value?: number;
}

export interface Trade {
  id: string;
  teamA: PlayerData[];
  teamB: PlayerData[];
}

const exampleTrade: Trade = {
  id: '123',
  teamA: [
    {
      id: 'Logan-Thomas',
      value: 1,
    },
  ],
  teamB: [
    {
      id: 'Terry-McLaurin',
      value: 3,
    },
  ],
};

export const saveTrade = async (trade: Trade) => {
  const client = await redisClient;
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
};

export const getTrade = async (id: string): Promise<Trade | undefined> => {
  const client = await redisClient;
  try {
    const trade = await client.json.get(`trades:${id}`);
    if (trade) {
      return JSON.parse(trade as string) as Trade;
    }
    throw new Error('Trade not found');
  } catch (error) {
    console.log(error);
  }
};
