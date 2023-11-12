import supertest from 'supertest';
import { app } from '../app';
import { updatePlayersTradeValues } from '../utils/redis/playerOperations';
import { CachedPlayerData } from '../types';

const api = supertest(app);

beforeEach(async () => {
  await updatePlayersTradeValues();
});

test('Expect all players to be returned', async () => {
  const response = await api
    .get('/api/players')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(response.body.length).toBe(30);

  console.log(response.body, 'response body');

  expect(
    response.body.findIndex(
      (item: CachedPlayerData) => item.name === 'Christian McCaffrey'
    )
  ).not.toBe(-1);
});

test('Expect all players to be returned when searching for RB', async () => {
  const response = await api
    .get('/api/players/search?position=RB')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(
    response.body.findIndex(
      (item: CachedPlayerData) => item.name === 'Christian McCaffrey'
    )
  ).not.toBe(-1);
});

test('Expect CMC to be returned with full test search ', async () => {
  const response = await api
    .get('/api/players/search?name=Christ')
    .expect(200)
    .expect('Content-Type', /application\/json/);

  expect(
    response.body.findIndex(
      (item: CachedPlayerData) => item.name === 'Christian McCaffrey'
    )
  ).not.toBe(-1);
});
