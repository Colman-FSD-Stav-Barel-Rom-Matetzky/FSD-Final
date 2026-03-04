import 'dotenv/config';
import { app } from './app';
import { AppConfig } from './config/app.config';

const PORT = AppConfig.port;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default server;
