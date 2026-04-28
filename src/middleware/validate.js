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
    console.log('Error type:', err?.constructor?.name);
    console.log('Error:', JSON.stringify(err, null, 2));
    if (err instanceof ZodError) {
      const errores = err.issues.map(e => ({
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
      const errores = err.issues.map(e => ({
        campo: e.path.join('.') || 'body',
        mensaje: e.message
      }));
      return next(AppError.badRequest('Error de validación', errores));
    }
    next(err);
  }
};


