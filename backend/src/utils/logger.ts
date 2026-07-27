/* eslint-disable no-console */

const timestamp = () => new Date().toISOString();

export const logger = {
  info: (message: string, ...meta: unknown[]) =>
    console.log(`[INFO] ${timestamp()} - ${message}`, ...meta),
  warn: (message: string, ...meta: unknown[]) =>
    console.warn(`[WARN] ${timestamp()} - ${message}`, ...meta),
  error: (message: string, ...meta: unknown[]) =>
    console.error(`[ERROR] ${timestamp()} - ${message}`, ...meta),
};
