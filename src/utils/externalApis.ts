import axios from 'axios';
import data from '../utils/mocks/database/fantasyCalcPlayers.json';

export const fantasyCalcApi = axios.get(
  'https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1'
);

export const getFantasyCalcData = async () => {
  if (process.env.NODE_ENV === 'production') {
    const response = await fantasyCalcApi;
    return response;
  }
  return {
    data,
  };
};
