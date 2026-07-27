import { createApp } from './app';
import { connectDatabase } from './database/connect';
import { env } from './config/env';
import { logger } from './utils/logger';

async function bootstrap(): Promise<void> {
  await connectDatabase();

  const app = createApp();

  app.listen(env.port, () => {
    logger.info(`Pocket C.A. API listening on port ${env.port} [${env.nodeEnv}]`);
  });
}

bootstrap().catch((error) => {
  logger.error('Failed to start server', error);
  process.exit(1);
});
