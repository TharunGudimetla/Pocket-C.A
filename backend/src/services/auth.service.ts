import { userRepository } from '../repositories/user.repository';
import { ApiError } from '../utils/ApiError';
import { signToken } from '../utils/jwt';
import { getStorageDriver } from '../config/storage';

interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

interface LoginInput {
  email: string;
  password: string;
}

function toPublicUser(user: { _id: unknown; name: string; email: string }) {
  return { id: String(user._id), name: user.name, email: user.email };
}

export const authService = {
  async register({ name, email, password }: RegisterInput) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw ApiError.conflict('An account with this email already exists');
    }

    const user = await userRepository.create({ name, email, password });
    const token = signToken({ userId: String(user._id), email: user.email });

    return { user: toPublicUser(user), token };
  },

  async login({ email, password }: LoginInput) {
    let user = await userRepository.findByEmail(email, true);

    // In memory mode, auto-create user on login if not found for friction-free developer experience
    if (!user && getStorageDriver() === 'memory') {
      const defaultName = email.includes('@') ? email.split('@')[0] : 'User';
      user = await userRepository.create({
        name: defaultName,
        email,
        password,
      });
    }

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    const token = signToken({ userId: String(user._id), email: user.email });
    return { user: toPublicUser(user), token };
  },
};
