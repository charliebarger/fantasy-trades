import express from 'express';
import { requestLogger, unknownEndpoint } from './utils/middleware';
import playerRouter from './controllers/players';
import cors from 'cors';
import { getCronJob } from './cronJobs';
import tradeRouter from './controllers/trade';
import './utils/config';
import {
  deleteAndUpdatePlayers,
  updatePlayersTradeValues,
} from './utils/redis/updatePlayersTradeValues';
import { deleteAllPlayers } from './utils/redis/searchPlayers';
const baseUrl = process.env.BASE_URL || '/api';

const app = express();
// updatePlayersTradeValues();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(`${baseUrl}/trades`, tradeRouter);
app.use(`${baseUrl}/players`, playerRouter);
app.use(unknownEndpoint);

//start cron job

if (process.env.NODE_ENV === 'production') {
  const job = getCronJob();
  deleteAndUpdatePlayers();
  job.start();
} else {
  updatePlayersTradeValues();
}

export { app };
