/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { TestSetup } from './test-setup';

describe('Auth (e2e)', () => {
  let testSetup: TestSetup;

  beforeEach(async () => {
    testSetup = await TestSetup.create(AppModule);
  });

  afterEach(async () => {
    await testSetup.cleanup();
  });

  afterAll(async () => {
    await testSetup.teardown();
  });

  const testUser = {
    email: 'test@test.com',
    password: 'password',
    name: 'Test User',
  };

  it('/auth/register (POST)', () => {
    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('email');
        expect(res.body).toHaveProperty('name');
        expect(res.body).not.toHaveProperty('password');
        expect(res.body.email).toEqual(testUser.email);
        expect(res.body.name).toEqual(testUser.name);
      });
  });

  it('/auth/register (POST) - existing user', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    return request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(409);
  });

  it('/auth/login (POST)', async () => {
    await request(testSetup.app.getHttpServer())
      .post('/auth/register')
      .send(testUser)
      .expect(201);

    return request(testSetup.app.getHttpServer())
      .post('/auth/login')
      .send(testUser)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('accessToken');
      });
  });
});
