import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../app';
import { DbConfig } from '../config/db.config';
import { Post } from '../models/post.model';
import { User } from '../models/user.model';
import { Comment } from '../models/comment.model';

type AuthResponse = {
  data: {
    accessToken: string;
    user: {
      _id: string;
    };
  };
  error?: string;
};

type CommentResponse = {
  data: {
    _id: string;
    content: string;
    owner: { _id: string; username: string };
    post: string;
  };
  error?: string;
};

type CommentsListResponse = {
  data: Array<{
    _id: string;
    content: string;
    owner: string;
    post: string;
  }>;
  nextCursor: string | null;
  error?: string;
};

type LikeResponse = {
  data: {
    likes: string[];
  };
  error?: string;
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

describe('Comment and Like Endpoints', () => {
  let ownerToken: string;
  let otherToken: string;
  let ownerId: string;
  let postId: string;

  beforeAll(async () => {
    if (Number(mongoose.connection.readyState) === 0) {
      await mongoose.connect(DbConfig.mongoUri);
    }
  });

  beforeEach(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await Comment.deleteMany({});

    ownerToken = await registerAndLogin('comment-owner', 'owner@example.com');
    otherToken = await registerAndLogin('comment-other', 'other@example.com');

    const owner = await User.findOne({ username: 'comment-owner' });

    if (!owner) {
      throw new Error('Owner user was not created');
    }

    ownerId = owner._id.toString();

    const post = await Post.create({ content: 'Test post', owner: ownerId });
    postId = post._id.toString();
  });

  afterAll(async () => {
    await Post.deleteMany({});
    await User.deleteMany({});
    await Comment.deleteMany({});
    await mongoose.connection.close();
  });

  it('should create a comment with content and post', async () => {
    const res = await request(app)
      .post('/comments')
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ content: 'hello', post: postId });

    const body = res.body as CommentResponse;

    expect(res.status).toBe(201);
    expect(body.data.content).toBe('hello');
    expect(body.data.post).toBe(postId);
    expect(body.data.owner._id).toBe(ownerId);
  });

  it('should get first page of comments with nextCursor', async () => {
    await Comment.create([
      { content: 'first comment', owner: ownerId, post: postId },
      { content: 'second comment', owner: ownerId, post: postId },
      { content: 'third comment', owner: ownerId, post: postId },
    ]);

    const res = await request(app).get(`/comments?postId=${postId}&limit=2`);

    const body = res.body as CommentsListResponse;

    expect(res.status).toBe(200);
    expect(body.data).toHaveLength(2);
    expect(body.nextCursor).toBe(body.data[1]?._id ?? null);
  });

  it('should get second page of comments using lastId cursor', async () => {
    await Comment.create([
      { content: 'first page comment 1', owner: ownerId, post: postId },
      { content: 'first page comment 2', owner: ownerId, post: postId },
      { content: 'second page comment', owner: ownerId, post: postId },
    ]);

    const firstPageRes = await request(app).get(
      `/comments?postId=${postId}&limit=2`,
    );
    const firstPageBody = firstPageRes.body as CommentsListResponse;

    expect(firstPageRes.status).toBe(200);

    const secondPageRes = await request(app).get(
      `/comments?postId=${postId}&limit=2&lastId=${firstPageBody.nextCursor}`,
    );

    const secondPageBody = secondPageRes.body as CommentsListResponse;

    expect(secondPageRes.status).toBe(200);
    expect(secondPageBody.data).toHaveLength(1);
  });

  it('should return 400 when postId is missing', async () => {
    const res = await request(app).get('/comments');

    expect(res.status).toBe(400);
  });

  it('should delete a comment when requested by the owner', async () => {
    const comment = await Comment.create({
      content: 'delete me',
      owner: ownerId,
      post: postId,
    });

    const res = await request(app)
      .delete(`/comments/${String(comment._id)}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const deletedComment = await Comment.findById(comment._id);

    expect(res.status).toBe(200);
    expect(deletedComment).toBeNull();
  });

  it('should reject deleting a comment by a non-owner with 403', async () => {
    const comment = await Comment.create({
      content: 'do not delete',
      owner: ownerId,
      post: postId,
    });

    const res = await request(app)
      .delete(`/comments/${String(comment._id)}`)
      .set('Authorization', `Bearer ${otherToken}`);

    const existingComment = await Comment.findById(comment._id);

    expect(res.status).toBe(403);
    expect(existingComment).not.toBeNull();
  });

  it('should add a like on first call to POST /posts/:id/like', async () => {
    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const body = res.body as LikeResponse;

    expect(res.status).toBe(200);
    expect(body.data.likes).toHaveLength(1);
    expect(body.data.likes[0]).toBe(ownerId);
  });

  it('should remove a like on second call to POST /posts/:id/like', async () => {
    await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const res = await request(app)
      .post(`/posts/${postId}/like`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const body = res.body as LikeResponse;

    expect(res.status).toBe(200);
    expect(body.data.likes).toHaveLength(0);
  });
});
