import { AppError } from '../utils/AppError.js';

export const restrictTo = (rolesPermitidos) => 
{
  return (req, res, next) => 
  {
    if (!rolesPermitidos.includes(req.user.role)) 
    {
      return next(new AppError(403, 'no tienes permisos'));
    }
    next();
  };
};