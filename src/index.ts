import morgan from 'morgan';

import { buildApp } from '~/app.js';
import { config } from '~/config.js';

const port = Number(process.env.PORT) || 3000;
const app = buildApp();

const logger =
  config.environment === 'development' ? morgan('dev') : morgan('tiny');

app.use(logger);

const server = app.listen(port, () => console.log(`Listening on port ${port}`));

process.on('SIGTERM', () => {
  console.log('SIGTERM received: closing server');
  server.close(() => console.log('Server closed'));
});
