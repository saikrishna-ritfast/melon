import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import routes from './routes';
import { redisRateLimiter } from './middleware/rate-limiter';

const app = express();
const PORT = process.env.PORT || 5000;

// Security configuration
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
  })
);

// Payload parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Redis-backed rate limiting
app.use(redisRateLimiter as any);

// Base routing
app.use('/api/v1', routes);

// 404 Route handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ status: 'fail', message: 'Resource not found' });
});

// Centralized error boundary
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('API Error:', err);

  const statusCode = err.status || err.statusCode || 500;
  const errMsg = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    status: 'error',
    message: errMsg,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode.`);
});
