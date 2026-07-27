import dotenv from 'dotenv';

dotenv.config();

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '';

/**
 * Centralized, typed access to environment variables.
 * Import this instead of reading process.env directly anywhere else.
 */
export const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pocket-ca',
  storageDriver: process.env.STORAGE_DRIVER || 'mongo',

  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  aiProvider: process.env.AI_PROVIDER || (geminiApiKey ? 'gemini' : 'mock'),
  aiApiKey: process.env.AI_API_KEY || '',
  geminiApiKey,
  geminiModel: process.env.GEMINI_MODEL || 'gemini-flash-lite-latest',
};

export const isProduction = env.nodeEnv === 'production';
