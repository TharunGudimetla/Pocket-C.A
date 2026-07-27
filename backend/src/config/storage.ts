import { env } from './env';

export type StorageDriver = 'mongo' | 'memory';

let activeStorageDriver: StorageDriver =
  env.storageDriver === 'memory' ? 'memory' : 'mongo';

export function getStorageDriver(): StorageDriver {
  return activeStorageDriver;
}

export function useMemoryStorage(): void {
  activeStorageDriver = 'memory';
}
