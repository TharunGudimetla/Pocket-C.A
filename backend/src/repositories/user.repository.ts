import { User, IUser } from '../models/User';
import { getStorageDriver } from '../config/storage';
import { memoryStore } from './memory.store';

/**
 * Repository layer isolates Mongoose/DB details from services,
 * so the persistence strategy can change without touching business logic.
 */
export const userRepository = {
  findByEmail(email: string, withPassword = false) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.findUserByEmail(email);
    }

    const query = User.findOne({ email: email.toLowerCase() });
    return withPassword ? query.select('+password') : query;
  },

  findById(id: string) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.findUserById(id);
    }

    return User.findById(id);
  },

  create(data: Pick<IUser, 'name' | 'email' | 'password'>) {
    if (getStorageDriver() === 'memory') {
      return memoryStore.createUser(data);
    }

    return User.create(data);
  },
};
