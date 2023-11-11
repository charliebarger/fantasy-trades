import { CronJob } from 'cron';
import { deleteAndUpdatePlayers } from './utils/redis/updatePlayersTradeValues';

//cron job that runs every 12 hours

export const getCronJob = () =>
  new CronJob(
    '0 0 */12 * * *',
    async () => {
      console.log(`running cron job at ${new Date().toLocaleString()}`);
      deleteAndUpdatePlayers();
    },
    null,
    true,
    'America/New_York'
  );
