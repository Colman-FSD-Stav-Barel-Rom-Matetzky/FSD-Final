import request from 'supertest';
import { app } from '../app';
import mongoose from 'mongoose';
import { User } from '../models/user.model';
import { DbConfig } from '../config/db.config';

beforeAll(async () => {
  await mongoose.connect(DbConfig.mongoUri);
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth Endpoints', () => {
  let refreshToken: string;
  let accessToken: string;

  type AuthResponse = {
    data: { accessToken: string; refreshToken: string };
    error?: string;
  };

  it('should register a new user', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      password: 'password123',
      email: 'testuser@example.com',
    });

    const body = res.body as AuthResponse;

    expect(res.status).toBe(201);
    expect(body.data).toHaveProperty('accessToken');
    expect(body.data).toHaveProperty('refreshToken');

    refreshToken = body.data.refreshToken;
    accessToken = body.data.accessToken;
  });

  it('should reject existing username', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser',
      password: 'password123',
      email: 'testuser@example.com',
    });

    const body = res.body as AuthResponse;
    expect(res.status).toBe(400);
    expect(body).toHaveProperty('error');
  });

  it('should reject registration with missing fields', async () => {
    const res = await request(app).post('/auth/register').send({
      username: 'testuser2',
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should login an existing user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'password123' });

    const body = res.body as AuthResponse;
    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty('accessToken');
  });

  it('should reject login with wrong password', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'testuser', password: 'wrongpassword' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should reject login with non-existent user', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ username: 'nonexistent', password: 'password123' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('error');
  });

  it('should refresh a token', async () => {
    const res = await request(app).post('/auth/refresh').send({ refreshToken });

    const body = res.body as AuthResponse;
    expect(res.status).toBe(200);
    expect(body.data).toHaveProperty('accessToken');
    expect(body.data).toHaveProperty('refreshToken');
    refreshToken = body.data.refreshToken;
    accessToken = body.data.accessToken;
  });

  it('should reject refresh with invalid token', async () => {
    const res = await request(app)
      .post('/auth/refresh')
      .send({ refreshToken: 'invalid' });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error');
  });

  it('should logout', async () => {
    const res = await request(app)
      .post('/auth/logout')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ refreshToken });

    expect(res.status).toBe(200);
  });
});
