import express from 'express';
import { requestLogger, unknownEndpoint } from './utils/middleware';
import playerRouter from './controllers/players';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const baseUrl = process.env.BASE_URL || '/api';

const app = express();
app.use(cors());
app.use(requestLogger);
app.use(`${baseUrl}/players`, playerRouter);
app.use(unknownEndpoint);
app.use(express.json());

export { app };
