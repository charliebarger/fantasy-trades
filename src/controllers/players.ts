import express from 'express';
import { searchPlayers, getAllPlayers } from '../utils/redis/searchPlayers';

const playerRouter = express.Router();

playerRouter.get('/', async (req, res) => {
  const players = await getAllPlayers();
  res.send(players);
});

playerRouter.get('/search', async (req, res) => {
  const position = req.query.position;
  let name = req.query.name;

  if (name) {
    if (typeof name === 'string') {
      if (name.includes('_')) {
        let nameArr = name.split('_');
        //if the last name is empty or only one character, remove it
        if (
          nameArr[nameArr.length - 1].length === 0 ||
          nameArr[nameArr.length - 1].length === 1
        ) {
          nameArr.pop();
        }
        //append wildcard to each name
        name = nameArr.join('* ');
      }
    }
  }

  const queryString = name ? `@name:(${name}*)` : `@position:${position}`;

  const searchResults = await searchPlayers(queryString);
  res.send(searchResults);
});

export default playerRouter;
