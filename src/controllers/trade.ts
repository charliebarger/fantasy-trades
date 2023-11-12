import express from 'express';
import { getTrade, saveTrade } from '../utils/redis/tradeOperations';
import { getPlayerData } from '../utils/redis/playerOperations';
import { isTrade } from '../utils/utils';
import { Trade } from '../types';
import { createError } from '../utils/utils';

const tradeRouter = express.Router();

tradeRouter.post('/', async (req, res) => {
  const trade = req.body;
  if (!isTrade(trade)) {
    throw createError(400, 'Invalid trade');
  }
  //if trade with same id exists, return error
  const existingTrade = await getTrade(trade.id);
  if (existingTrade) {
    throw createError(409, 'Trade already exists');
  }
  //check if players exist
  await getPlayerData(trade.teamA, trade.fleece);
  await getPlayerData(trade.teamB, trade.fleece);

  await saveTrade(trade as Trade);
  res.status(201).send('Trade saved');
});

tradeRouter.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (typeof id !== 'string') {
      res.send('Invalid trade id');
      return;
    }
    const trade = await getTrade(id);
    if (!trade) {
      res.status(404).send('Trade not found');
      return;
    }
    //if trade is found find the players
    try {
      const teamA = await getPlayerData(trade.teamA, trade.fleece);
      const teamB = await getPlayerData(trade.teamB, trade.fleece);

      res.send({
        ...trade,
        teamA,
        teamB,
      });
    } catch (error) {
      throw new Error('Player not found');
    }
  } catch (error) {
    res.status(404).send((error as Error).message);
  }
});

export default tradeRouter;
