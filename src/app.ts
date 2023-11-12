import express from 'express';
const morgan = require('morgan');
import cors from 'cors';
import 'express-async-errors'; // Import this early for async error handling
import './utils/config';
import { unknownEndpoint, errorHandler } from './utils/middleware';
import playerRouter from './controllers/players';
import tradeRouter from './controllers/trade';
import { getCronJob } from './cronJobs';
import { deleteAndUpdatePlayers } from './utils/redis/playerOperations';

const baseUrl = process.env.BASE_URL || '/api';

const app = express();
// updatePlayersTradeValues();

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('short'));
}

app.use(cors());
app.use(express.json());
app.use(`${baseUrl}/trades`, tradeRouter);
app.use(`${baseUrl}/players`, playerRouter);
app.use(errorHandler);
app.use(unknownEndpoint);

//start cron job

if (process.env.NODE_ENV === 'production') {
  const job = getCronJob();
  deleteAndUpdatePlayers();
  job.start();
}

export { app };
