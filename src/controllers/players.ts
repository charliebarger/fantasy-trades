import express from 'express';
import axios from 'axios';
import getOrSetCache from '../utils/redisCache';

const playerRouter = express.Router();

interface PlayerData {
  player: {
    id: number;
    name: string;
    mflId: string;
    sleeperId: string;
    position: string;
    maybeBirthday: string;
    maybeHeight: string;
    maybeWeight: number;
    maybeCollege: string;
    maybeTeam: string;
    maybeAge: number;
    maybeYoe: number;
    espnId: string;
    fleaflickerId: string;
  };
  value: number;
  overallRank: number;
  positionRank: number;
  trend30Day: number;
  redraftDynastyValueDifference: number;
  redraftDynastyValuePercDifference: number;
  redraftValue: number;
  combinedValue: number;
  maybeMovingStandardDeviation: number;
  maybeMovingStandardDeviationPerc: number;
  maybeMovingStandardDeviationAdjusted: number;
  displayTrend: boolean;
  maybeOwner: any;
  starter: boolean;
  maybeTier: number;
  maybeAdp: any;
  maybeTradeFrequency: number;
}

export interface CachedPlayerData {
  name: string;
  position: string;
  espnId: string;
  value: number;
}

const fantasyCalcApi = axios.get(
  'https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1'
);

const getTradeValues = async (): Promise<
  {
    name: string;
    position: string;
    espnId: string;
    value: number;
  }[]
> => {
  const { data }: { data: PlayerData[] } = await fantasyCalcApi;
  const players = data.map(
    (playerInfo: PlayerData): CachedPlayerData => ({
      name: playerInfo.player.name,
      position: playerInfo.player.position,
      espnId: playerInfo.player.espnId,
      value: Math.round(playerInfo.value / 100),
    })
  );
  return players;
};

playerRouter.get('/', async (_req, res) => {
  try {
    const tradeValues = await getTradeValues();

    const values = tradeValues.map(async (player) => {
      return asyncFunction(player);
    });

    const data = await getOrSetCache('players', getTradeValues);
    return res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'could not retrieve data' });
  }
});

export default playerRouter;
