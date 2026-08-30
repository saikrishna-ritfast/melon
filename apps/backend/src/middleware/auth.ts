import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkeychangeinprod';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'CUSTOMER' | 'ADMIN';
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'fail', message: 'No token provided, authorization denied' });
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'CUSTOMER' | 'ADMIN';
    };
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ status: 'fail', message: 'Token is invalid or expired' });
  }
};

export const authorize = (...roles: Array<'CUSTOMER' | 'ADMIN'>) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        status: 'fail',
        message: 'Forbidden: You do not have permission to access this resource',
      });
      return;
    }
    next();
  };
};
