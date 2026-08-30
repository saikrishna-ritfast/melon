import { Request, Response, NextFunction } from 'express';
import { redisClient } from '../services/redis.service';

export const redisRateLimiter = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-ip';
    const limitKey = `rate-limit:${ip}`;

    // Increment request count for IP
    const currentRequests = await redisClient.incr(limitKey);

    if (currentRequests === 1) {
      // Set TTL window to 60 seconds on first request
      await redisClient.expire(limitKey, 60);
    }

    // Limit to 100 requests per minute
    if (currentRequests > 100) {
      res.status(429).json({
        status: 'fail',
        message: 'Too many requests. Please try again after 60 seconds.',
      });
      return;
    }

    next();
  } catch (error) {
    // Fail-open strategy: proceed if Redis fails to ensure API availability
    console.error('Rate limiting error, passing through:', error);
    next();
  }
};
