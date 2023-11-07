import { CronJob } from 'cron';
import { updatePlayersTradeValues } from './utils/redis/updatePlayersTradeValues';

//cron job that runs every 12 hours

export const job = new CronJob(
  '0 0 */12 * * *',
  updatePlayersTradeValues,
  null,
  true,
  'America/New_York'
);
