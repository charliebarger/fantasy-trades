import { Trade } from '../types';

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

export const createError = (statusCode: number, message: string): Error => {
  const error: any = new Error(message);
  error.statusCode = statusCode;
  return error;
};
