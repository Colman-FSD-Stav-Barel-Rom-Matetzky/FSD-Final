import dotenv from 'dotenv';
dotenv.config({ path: '.env' });

process.env.MONGO_URI = 'mongodb://localhost:27017/Threadly_test';
process.env.PORT = '4040';
process.env.GOOGLE_CLIENT_ID = 'test-client-id';
process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
process.env.GOOGLE_CALLBACK_URL = '/auth/google/callback';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
