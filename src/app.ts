import express from 'express';
import { requestLogger, unknownEndpoint } from './utils/middleware';
import playerRouter from './controllers/players';
import cors from 'cors';
import dotenv from 'dotenv';
import { job } from './cronJobs';
import tradeRouter from './controllers/trade';
import { updatePlayersTradeValues } from './utils/redis/updatePlayersTradeValues';

dotenv.config();

const baseUrl = process.env.BASE_URL || '/api';
updatePlayersTradeValues();
const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(`${baseUrl}/trades`, tradeRouter);
app.use(`${baseUrl}/players`, playerRouter);
app.use(unknownEndpoint);

//start cron job
job.start();

export { app };
