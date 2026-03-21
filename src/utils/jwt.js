import jwt from 'jsonwebtoken';
import { AppError } from './AppError.js';
import crypto from 'crypto'

export const generateToken = (userId) => 
{
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

export const generateRefreshToken = () => {
  return crypto.randomBytes(64).toString('hex');
};

export const getRefreshTokenExpiry = () => {
  const expiry = new Date();
  expiry.setDate(expiry.getDate() + REFRESH_TOKEN_DAYS);
  return expiry;
};

export const verifyToken = (token) => 
{
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new AppError(401, 'token no valido o expirado');
  }
};

