export class AppError extends Error {
  constructor(statusCode, message, details = null) 
  {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) 
  {
    return new AppError(400, message, details);
  }

  static unauthorized(message = 'No autorizado') 
  {
    return new AppError(401, message);
  }

  static forbidden(message = 'Prohibido') 
  {
    return new AppError(403, message);
  }

  static notFound(message = 'No encontrado') 
  {
    return new AppError(404, message);
  }

  static conflict(message = 'Conflicto') 
  {
    return new AppError(409, message);
  }

  static tooManyRequests(message = 'Demasiadas solicitudes') 
  {
    return new AppError(429, message);
  }

  static internal(message = 'Error interno del servidor') 
  {
    return new AppError(500, message);
  }
}