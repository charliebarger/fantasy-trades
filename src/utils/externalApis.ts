import axios from 'axios';

export const fantasyCalcApi = axios.get(
  'https://api.fantasycalc.com/values/current?isDynasty=false&numQbs=1&numTeams=12&ppr=1'
);
