import supertest from 'supertest';
import { app } from '../app';
import { redisClient } from '../utils/redis/connection';
const api = supertest(app);

test('notes are returned as json', async () => {
  console.log('test', process.env.REDIS_USERNAME);
  await api
    .get('/api/players')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

afterAll(async () => {
  //kill redis connection
  const client = await redisClient;
  client.quit();
});
