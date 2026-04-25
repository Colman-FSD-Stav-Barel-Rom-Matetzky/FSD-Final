import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { User } from '../models/user.model';
import { DbConfig } from '../config/db.config';
import path from 'path';
import fs from 'fs';

type AuthResponse = { data: { accessToken: string; user: { _id: string } } };
type UserResponse = {
  data: {
    username: string;
    email: string;
    profileImage?: string;
    password?: string;
  };
};

describe('User Endpoints', () => {
  let user1Token: string;
  let user1Id: string;
  let user2Id: string;

  const testImageDir = path.join(__dirname, 'test-assets');
  const testImagePath = path.join(testImageDir, 'test-profile.jpg');

  beforeAll(async () => {
    await mongoose.connect(DbConfig.mongoUri);
    await User.deleteMany({});

    if (!fs.existsSync(testImageDir)) {
      fs.mkdirSync(testImageDir, { recursive: true });
    }
    fs.writeFileSync(testImagePath, 'dummy image content');

    const res1 = await request(app).post('/auth/register').send({
      email: 'user1@test.com',
      password: 'Password123!',
      username: 'user1',
    });
    user1Token = (res1.body as AuthResponse).data.accessToken;
    user1Id = (res1.body as AuthResponse).data.user._id;

    const res2 = await request(app).post('/auth/register').send({
      email: 'user2@test.com',
      password: 'Password123!',
      username: 'user2',
    });
    user2Id = (res2.body as AuthResponse).data.user._id;
  });

  afterAll(async () => {
    await User.deleteMany({});

    if (fs.existsSync(testImagePath)) {
      fs.unlinkSync(testImagePath);
    }

    if (fs.existsSync(testImageDir)) {
      fs.rmdirSync(testImageDir);
    }

    await mongoose.connection.close();
  });

  describe('GET /users/:id', () => {
    it('should successfully retrieve profile by the owner', async () => {
      const response = await request(app)
        .get(`/users/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(200);
      const resBody = response.body as UserResponse;
      expect(resBody.data.username).toBe('user1');
      expect(resBody.data.email).toBe('user1@test.com');
      expect(resBody.data).not.toHaveProperty('password');
    });

    it('should return 401 for unauthenticated access (no token)', async () => {
      const response = await request(app).get(`/users/${user1Id}`);
      expect(response.status).toBe(401);
    });

    it('should return 404 for non-existent user ID', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      const response = await request(app)
        .get(`/users/${fakeId}`)
        .set('Authorization', `Bearer ${user1Token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /users/:id', () => {
    it('should successfully update username', async () => {
      const response = await request(app)
        .put(`/users/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ username: 'user1Updated' });

      expect(response.status).toBe(200);
      const resBody = response.body as UserResponse;
      expect(resBody.data.username).toBe('user1Updated');
    });

    it('should successfully upload a profileImage', async () => {
      const response = await request(app)
        .put(`/users/${user1Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .field('username', 'user1WithImage')
        .attach('profileImage', testImagePath);

      expect(response.status).toBe(200);
      const resBody = response.body as UserResponse;
      expect(resBody.data.username).toBe('user1WithImage');
      expect(resBody.data.profileImage).toBeDefined();
    });

    it('should return 403 when attempting to update another users profile', async () => {
      const response = await request(app)
        .put(`/users/${user2Id}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ username: 'hackerman' });

      expect(response.status).toBe(403);
    });

    it('should return 401 for unauthenticated update attempt', async () => {
      const response = await request(app)
        .put(`/users/${user1Id}`)
        .send({ username: 'unauthUpdate' });

      expect(response.status).toBe(401);
    });
  });
});
