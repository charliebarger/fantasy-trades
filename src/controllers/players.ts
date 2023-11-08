import express from 'express';
import { searchPlayers, getAllPlayers } from '../utils/redis/searchPlayers';
import { addWildcardToString } from '../utils/utils';

const playerRouter = express.Router();

playerRouter.get('/', async (req, res) => {
  try {
    const players = await getAllPlayers();
    res.send(players);
  } catch (error) {
    res.status(500).send('An error occurred while processing your request.');
  }
});

playerRouter.get('/search', async (req, res) => {
  try {
    const position = req.query.position;
    let name = req.query.name;

    if (name) {
      if (typeof name === 'string') {
        name = addWildcardToString(name);
      }
    }

    const queryString = name ? `@name:(${name}*)` : `@position:${position}`;

    const searchResults = await searchPlayers(queryString);
    res.send(searchResults);
  } catch (error) {
    console.log(error);
    res.status(500).send('An error occurred while processing your request.');
  }
});

export default playerRouter;
