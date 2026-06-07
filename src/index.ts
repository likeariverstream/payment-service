import morgan from 'morgan';

import { buildApp } from '~/app.js';
import { config } from '~/config.js';
import { dbConnect } from '~/lib/db-connect.js';
import { redis } from '~/lib/redis.js';

const port = Number(process.env.PORT) || 3000;
const app = buildApp();

const logger =
  config.environment === 'development' ? morgan('dev') : morgan('tiny');

app.use(logger);

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

dbConnect();

await redis.connect();

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  redis.destroy();
  server.close(() => console.log('Server closed'));
});
