import jwt from 'jsonwebtoken';
import User from '../models/User.js'; 

export const authSocketMiddleware = async (socket, next) => {
  const token = socket.handshake.auth.token || 
                socket.handshake.headers.authorization?.split(' ')[1];

  if (!token) return next(new Error('Token no proporcionado'));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findById(decoded.id);
    
    if (!user) return next(new Error('Usuario no encontrado'));

    socket.user = {
      id: user._id,
      companyId: user.company 
    };
    
    next();
  } catch (error) {
    next(new Error('Token inválido'));
  }
};