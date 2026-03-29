import fs from 'fs/promises';
import path from 'path';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { DbConfig } from '../config/db.config';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';

type AuthResponse = {
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      _id: string;
    };
  };
  error?: string;
};

type PostResponse = {
  data: {
    _id: string;
    content: string;
    image?: string;
    owner: string;
  };
  error?: string;
};

type PostsListResponse = {
  data: Array<{
    _id: string;
    content: string;
    image?: string;
    owner: string;
  }>;
  nextCursor: string | null;
  error?: string;
};

const uploadsDir = path.join(process.cwd(), 'uploads', 'posts');
const fixtureImagePath = path.join(__dirname, 'fixtures', 'test-image.png');

const cleanupUploads = async () => {
  await fs.rm(uploadsDir, { recursive: true, force: true });
  await fs.mkdir(uploadsDir, { recursive: true });
};

const registerAndLogin = async (username: string, email: string) => {
  const password = 'password123';

  const registerRes = await request(app).post('/auth/register').send({
    username,
    email,
    password,
  });

  expect(registerRes.status).toBe(201);

  const loginRes = await request(app).post('/auth/login').send({
    username,
    password,
  });

  const body = loginRes.body as AuthResponse;

  expect(loginRes.status).toBe(200);

  return body.data.accessToken;
};

describe('Post Endpoints', () => {
  let ownerToken: string;
  let otherToken: string;
  let ownerId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(DbConfig.mongoUri);
    }
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await cleanupUploads();

    ownerToken = await registerAndLogin('post-owner', 'owner@example.com');
    otherToken = await registerAndLogin('post-other', 'other@example.com');

    const owner = await User.findOne({ username: 'post-owner' });

    if (!owner) {
      throw new Error('Owner user was not created');
    }

    ownerId = owner._id.toString();
  });

  afterAll(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await cleanupUploads();
    await mongoose.connection.close();
  });

  it('should create a post without an image', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('content', 'text only post');

    const body = res.body as PostResponse;

    expect(res.status).toBe(201);
    expect(body.data.content).toBe('text only post');
    expect(body.data.image).toBeUndefined();
  });

  it('should create a post with an image', async () => {
    const res = await request(app)
      .post('/posts')
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('content', 'image post')
      .attach('image', fixtureImagePath);

    const body = res.body as PostResponse;

    expect(res.status).toBe(201);
    expect(body.data.content).toBe('image post');
    expect(body.data.image).toMatch(/^\/uploads\/posts\//);
  });

  it('should get the first page of posts with a next cursor', async () => {
    await Post.create([
      { content: 'first post', owner: ownerId },
      { content: 'second post', owner: ownerId },
      { content: 'third post', owner: ownerId },
    ]);

    const res = await request(app)
      .get('/posts?limit=2')
      .set('Authorization', `Bearer ${ownerToken}`);

    const body = res.body as PostsListResponse;

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.nextCursor).toBe(body.data[1]?._id ?? null);
  });

  it('should get the second page of posts using a cursor', async () => {
    await Post.create([
      { content: 'first page post', owner: ownerId },
      { content: 'second page post', owner: ownerId },
      { content: 'third page post', owner: ownerId },
    ]);

    const firstPageRes = await request(app)
      .get('/posts?limit=2')
      .set('Authorization', `Bearer ${ownerToken}`);

    const firstPageBody = firstPageRes.body as PostsListResponse;

    const secondPageRes = await request(app)
      .get(`/posts?limit=2&lastId=${firstPageBody.nextCursor}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const secondPageBody = secondPageRes.body as PostsListResponse;

    expect(firstPageRes.status).toBe(200);
    expect(secondPageRes.status).toBe(200);
    expect(secondPageBody.data).toHaveLength(1);
  });

  it('should get a post by id', async () => {
    const post = await Post.create({ content: 'single post', owner: ownerId });

    const res = await request(app)
      .get(`/posts/${post._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const body = res.body as PostResponse;

    expect(res.status).toBe(200);
    expect(body.data._id).toBe(post._id.toString());
  });

  it('should update a post when requested by the owner', async () => {
    const post = await Post.create({
      content: 'before update',
      owner: ownerId,
    });

    const res = await request(app)
      .put(`/posts/${post._id}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .field('content', 'after update');

    const body = res.body as PostResponse;

    expect(res.status).toBe(200);
    expect(body.data.content).toBe('after update');
  });

  it('should reject updating a post by a non-owner', async () => {
    const post = await Post.create({
      content: 'protected post',
      owner: ownerId,
    });

    const res = await request(app)
      .put(`/posts/${post._id}`)
      .set('Authorization', `Bearer ${otherToken}`)
      .field('content', 'unauthorized update');

    expect(res.status).toBe(403);
  });

  it('should delete a post when requested by the owner', async () => {
    const post = await Post.create({ content: 'delete me', owner: ownerId });

    const res = await request(app)
      .delete(`/posts/${post._id}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const deletedPost = await Post.findById(post._id);

    expect(res.status).toBe(200);
    expect(deletedPost).toBeNull();
  });

  it('should reject deleting a post by a non-owner', async () => {
    const post = await Post.create({
      content: 'do not delete',
      owner: ownerId,
    });

    const res = await request(app)
      .delete(`/posts/${post._id}`)
      .set('Authorization', `Bearer ${otherToken}`);

    const existingPost = await Post.findById(post._id);

    expect(res.status).toBe(403);
    expect(existingPost).not.toBeNull();
  });
});
