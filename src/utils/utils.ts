import { PlayerId, PlayerWithValues } from '../utils/redis/saveTrade';
import { Trade } from '../utils/redis/saveTrade';
import { getPlayerById } from '../utils/redis/updatePlayersTradeValues';
import { CachedPlayerData } from '../types';
import { deleteAllPlayers } from './redis/searchPlayers';

export const removeUnderScores = (str: string) => {
  return str.replace(/_/g, ' ');
};

const addFakeValues = (player: CachedPlayerData, value: number) => {
  return {
    ...player,
    value,
  };
};

export const getPlayerData = async (
  playerArr: PlayerId[] | PlayerWithValues[],
  thisIsAFleece: boolean
): Promise<CachedPlayerData[]> => {
  return Promise.all(
    playerArr.map(async (player) => {
      const playerData = await getPlayerById(player.id);
      if (thisIsAFleece) {
        const playerWithValues = player as PlayerWithValues;
        return addFakeValues(
          playerData,
          playerWithValues.value || playerData.value
        );
      } else {
        return playerData;
      }
    })
  );
};

export function isTrade(obj: any): obj is Trade {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.fleece === 'boolean' &&
    Array.isArray(obj.teamA) &&
    Array.isArray(obj.teamB)
    // Add more checks if necessary
  );
}

export function addWildcardToString(str: string) {
  if (str.includes('_')) {
    let nameArr = str.split('_');
    //if the last name is empty or only one character, remove it
    if (
      nameArr[nameArr.length - 1].length === 0 ||
      nameArr[nameArr.length - 1].length === 1
    ) {
      nameArr.pop();
    }
    //append wildcard to each name
    return nameArr.join('* ');
  }
  return str;
}
