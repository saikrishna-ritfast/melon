import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

export const validate = (schema: ZodSchema, target: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req[target] = await schema.parseAsync(req[target]);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'fail',
          message: 'Validation error',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};