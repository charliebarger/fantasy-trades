import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';

export const requestLogger = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  console.log('Method:', request.method);
  console.log('Path:  ', request.path);
  console.log('Body:  ', request.body);
  console.log('---');
  next();
};

export const unknownEndpoint = (request: Request, response: Response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

export const errorHandler: ErrorRequestHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Check if the error has a specific status code, otherwise default to 500 (Internal Server Error)

  console.log(err, 'bark');

  const statusCode = err.statusCode || 500;

  // Send the error response to the client
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
};
