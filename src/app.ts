import express from 'express';
import { requestLogger, unknownEndpoint } from './utils/middleware';
import playerRouter from './controllers/players';
import cors from 'cors';
import dotenv from 'dotenv';
import { job } from './cronJobs';

dotenv.config();

const baseUrl = process.env.BASE_URL || '/api';

const app = express();
app.use(cors());
app.use(requestLogger);
app.use(`${baseUrl}/players`, playerRouter);
app.use(unknownEndpoint);
app.use(express.json());

//start cron job
job.start();

export { app };
