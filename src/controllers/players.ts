import express from 'express';
import { searchPlayers, getAllPlayers } from '../utils/redis/playerOperations';
import { addWildcardToString } from '../utils/utils';

const playerRouter = express.Router();

playerRouter.get('/', async (_, res) => {
  const players = await getAllPlayers();
  res.status(200).send(players);
});

playerRouter.get('/search', async (req, res) => {
  const { name, position } = req.query;
  const queryString = name
    ? `@name:(${addWildcardToString(name as string)}*)`
    : `@position:${position}`;
  const searchResults = await searchPlayers(queryString);
  res.send(searchResults);
});

export default playerRouter;
