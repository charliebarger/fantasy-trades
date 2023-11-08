import express from 'express';
import { getTrade, saveTrade } from '../utils/redis/saveTrade';
import { Trade } from '../utils/redis/saveTrade';
import { getPlayerById } from '../utils/redis/updatePlayersTradeValues';
import { CachedPlayerData } from '../types';
const tradeRouter = express.Router();

const addFakeValues = (player: CachedPlayerData, value: number) => {
  return {
    ...player,
    value,
  };
};

tradeRouter.get('/:id', async (req, res) => {
  const id = req.params.id;
  if (typeof id !== 'string') {
    res.send('Invalid trade id');
    return;
  }
  const trade = await getTrade(id);
  if (!trade) {
    res.send('Trade not found').status(404);
    return;
  }
  //if trade is found find the players
  const teamA = await Promise.all(
    trade.teamA.map(async (player) => {
      const playerData = await getPlayerById(player.id);
      return addFakeValues(playerData, player.value || playerData.value);
    })
  );
  const teamB = await Promise.all(
    trade.teamB.map(async (player) => {
      const playerData = await getPlayerById(player.id);
      return addFakeValues(playerData, player.value || playerData.value);
    })
  );

  res.send({
    ...trade,
    teamA,
    teamB,
  });
});

tradeRouter.post('/', async (req, res) => {
  console.log('hit trade post');
  const trade = req.body;
  console.log(trade);
  saveTrade(trade as Trade);
  res.send('Trade saved').status(200);
});

export default tradeRouter;
