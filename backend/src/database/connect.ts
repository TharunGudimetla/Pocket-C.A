import mongoose from 'mongoose';
import { env } from '../config/env';
import { getStorageDriver, useMemoryStorage } from '../config/storage';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
  if (getStorageDriver() === 'memory') {
    logger.info('Using in-memory storage for local development');
    return;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(env.mongoUri);
    logger.info(`MongoDB connected -> ${mongoose.connection.name}`);
  } catch (error) {
    logger.error('MongoDB connection failed', error);
    if (env.nodeEnv !== 'production') {
      useMemoryStorage();
      logger.warn('Falling back to in-memory storage for this development session');
      return;
    }
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}
