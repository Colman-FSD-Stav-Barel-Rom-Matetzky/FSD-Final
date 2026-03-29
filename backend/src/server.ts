import 'dotenv/config';
import { app, connectDB } from './app';
import { AppConfig } from './config/app.config';

const PORT = AppConfig.port;

void connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
});

export default app;
