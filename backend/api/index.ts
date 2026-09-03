import { Request, Response } from 'express';
import { createApp } from '../src/app';
import { connectDatabase } from '../src/database/connect';

const app = createApp();
const databaseReady = connectDatabase();

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await databaseReady;
    app(req, res);
  } catch (error) {
    console.error('Failed to initialize API', error);
    res.status(500).json({
      success: false,
      message: 'API failed to initialize',
    });
  }
}