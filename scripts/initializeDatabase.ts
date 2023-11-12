import { updatePlayersTradeValues } from '../src/utils/redis/updatePlayersTradeValues';

import dotenvFlow from 'dotenv-flow';
dotenvFlow.config();

console.log('updating players trade values...', process.env.REDIS_URL);
updatePlayersTradeValues();
