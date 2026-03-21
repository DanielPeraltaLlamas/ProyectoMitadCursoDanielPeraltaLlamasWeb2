import { ZodError } from 'zod';
import { AppError } from '../utils/AppError.js';

export const validate = (schema) => async (req, res, next) => {
  try {
    await schema.parseAsync({
      body: req.body,
      query: req.query,
      params: req.params
    });
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errores = err.errors.map(e => ({
        campo: e.path.join('.') || 'body',
        mensaje: e.message
      }));
      return next(AppError.badRequest('Error de validación', errores));
    }
    next(err);
  }
};

export const validateBody = (schema) => async (req, res, next) => {
  try {
    
    await schema.parseAsync(req.body ?? {});
    next();
  } catch (err) {
    if (err instanceof ZodError) {
      const errores = err.errors.map(e => ({
        campo: e.path.join('.') || 'body',
        mensaje: e.message
      }));
      return next(AppError.badRequest('Error de validación', errores));
    }
    next(err);
  }
};


