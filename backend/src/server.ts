import 'dotenv/config';
import { app, connectDB } from './app';
import { AppConfig } from './config/app.config';
import https from 'https';
import http from 'http';
import fs from 'fs';

const PORT = AppConfig.port;

void connectDB().then(() => {
  if (process.env.NODE_ENV !== 'production') {
    http.createServer(app).listen(PORT);
  }

  const options = {
    key: fs.readFileSync('./client-key.pem'),
    cert: fs.readFileSync('./client-cert.pem'),
  };

  https.createServer(options, app).listen(process.env.HTTPS_PORT);
});

export default app;
