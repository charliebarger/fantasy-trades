import express from 'express';
import { getTrade, saveTrade } from '../utils/redis/saveTrade';
import { Trade } from '../utils/redis/saveTrade';
import { getPlayerData } from '../utils/utils';
import { isTrade } from '../utils/utils';

const tradeRouter = express.Router();

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
    const teamA = await getPlayerData(trade.teamA, trade.fleece);
    const teamB = await getPlayerData(trade.teamB, trade.fleece);

    res.send({
      ...trade,
      teamA,
      teamB,
    });
  } catch (error) {
    console.log('myt ');
    res.status(404).send('Trade not found');
  }
});

tradeRouter.post('/', async (req, res) => {
  try {
    const trade = req.body;
    if (!isTrade(trade)) {
      res.status(400).send('Invalid trade data');
      return;
    }
    //if trade with same id exists, return error
    const existingTrade = await getTrade(trade.id);
    if (existingTrade) {
      console.log('trade already exists');
      res.status(409).send('Trade already exists');
      return;
    }
    saveTrade(trade as Trade);
    res.send('Trade saved').status(200);
  } catch (error) {
    res.status(500).send('An error occurred while processing your request.');
  }
});

export default tradeRouter;
