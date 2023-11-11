import supertest from 'supertest';
import { app } from '../app';
import { job } from '../cronJobs';

const api = supertest(app);

test('notes are returned as json', async () => {
  await api
    .get('/api/players')
    .expect(200)
    .expect('Content-Type', /application\/json/);
});

afterAll(() => {
  //stop cron job
  job.stop();
});
