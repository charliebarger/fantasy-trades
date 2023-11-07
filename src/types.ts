export interface PlayerData {
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
  team: string;
}
