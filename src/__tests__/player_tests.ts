import supertest from 'supertest';
import { app } from '../app';

const api = supertest(app);

test('Expect all players to be returned', async () => {
  await api
    .get('/api/players')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});
