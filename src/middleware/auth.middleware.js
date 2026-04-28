// src/middleware/auth.middleware.js
import jwt from 'jsonwebtoken';
import { AppError } from '../utils/AppError.js';
import User from '../models/User.js';

const authMiddleware = async (req, res, next) => {
  
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) 
    {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) 
    {
      return next(new AppError(401, 'necesitas token'));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || user.deleted) 
    {
      return next(new AppError(401, 'usuario no encontrado o eliminado'));
    }

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError(401, 'token inválido o expirado'));
  }
};

export default authMiddleware