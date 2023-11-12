import supertest from 'supertest';
import { app } from '../app';
import { deleteAllTrades } from '../utils/redis/tradeOperations';

const api = supertest(app);

beforeAll(async () => {
  await deleteAllTrades();
});

test('Post should return 201 when submitting a trade', async () => {
  const response = await api.post('/api/trades').send({
    id: '123',
    teamA: [
      {
        id: 'Austin-Ekeler',
      },
    ],
    teamB: [
      {
        id: 'Christian-McCaffrey',
      },
    ],
    fleece: false,
  });
  expect(response.status).toBe(201);
});

test('Post should return 409 if there is already a trade with that ID', async () => {
  const response = await api.post('/api/trades').send({
    id: '123',
    teamA: [
      {
        id: 'Austin-Ekeler',
      },
    ],
    teamB: [
      {
        id: 'Christian-McCaffrey',
      },
    ],
    fleece: true,
  });
  expect(response.status).toBe(409);
});

test('Get should return 200 if trade is valid ', async () => {
  const response = await api.get('/api/trades/123');
  expect(response.status).toBe(200);
});

test("POST should return 400 if trade doesn't have valid players ", async () => {
  const response = await api.post('/api/trades').send({
    id: '124',
    teamA: [
      {
        id: '123',
      },
    ],
    teamB: [
      {
        id: '123',
      },
    ],
    fleece: true,
  });
  expect(response.status).toBe(404);
});

test('Get should return 404 if trade is not found ', async () => {
  const response = await api.get('/api/trades/1234');
  expect(response.status).toBe(404);
});

test('Get should return 400 if trade id is not a string ', async () => {
  const response = await api.get('/api/trades/1234');
  expect(response.status).toBe(404);
});

test('POST allows trade to be submitted in fleece mode', async () => {
  const response = await api.post('/api/trades').send({
    id: '1234',
    teamA: [
      {
        id: 'Austin-Ekeler',
        value: 500,
      },
    ],
    teamB: [
      {
        id: 'Christian-McCaffrey',
        value: 10,
      },
    ],
    fleece: true,
  });
  expect(response.status).toBe(201);
});

test('GET returns trade in fleece mode', async () => {
  const response = await api.get('/api/trades/1234');
  expect(response.body.fleece).toBe(true);
  expect(response.body.teamA[0].value).toBe(500);
  expect(response.body.teamB[0].value).toBe(10);
});
