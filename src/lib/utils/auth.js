import bcrypt from 'bcryptjs';
import { ValidationError } from './error';

// Şifre hashleme
export const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  } catch (error) {
    throw new ValidationError('Şifre hashleme işlemi başarısız oldu');
  }
};