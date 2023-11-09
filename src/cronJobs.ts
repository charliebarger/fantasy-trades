import { CronJob } from 'cron';
import { updatePlayersTradeValues } from './utils/redis/updatePlayersTradeValues';
import { deleteAllPlayers } from './utils/redis/searchPlayers';

//cron job that runs every 12 hours

export const job = new CronJob(
  '0 0 */12 * * *',
  async () => {
    console.log(`running cron job at ${new Date().toLocaleString()}`);
    await deleteAllPlayers();
    updatePlayersTradeValues();
  },
  null,
  true,
  'America/New_York'
);
