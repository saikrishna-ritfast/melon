import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { redisClient } from '../services/redis.service';
import { prisma } from '../services/db.service';

// Cart expires in Redis after 7 days
const CART_TTL = 7 * 24 * 60 * 60;

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const cartKey = `cart:${userId}`;
    let cartData: string | null = null;

    try {
      if (redisClient.isOpen) {
        cartData = await redisClient.get(cartKey);
      } else {
        console.warn('Redis client is offline. Skipping cart fetch from cache.');
      }
    } catch (redisError) {
      console.error('Failed to fetch cart from Redis:', redisError);
    }

    if (!cartData) {
      res.status(200).json({ status: 'success', data: { items: [] } });
      return;
    }

    const parsedCart = JSON.parse(cartData);
    const items = parsedCart.items || [];

    if (items.length === 0) {
      res.status(200).json({ status: 'success', data: { items: [] } });
      return;
    }

    const variantIds = items.map((item: any) => item.variantId);

    // Query databases for pricing and description
    const dbVariants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            description: true,
            specs: true,
            category: {
              select: {
                name: true,
                slug: true,
              },
            },
          },
        },
        inventory: {
          select: {
            stock: true,
          },
        },
      },
    });

    const variantMap = new Map<string, typeof dbVariants[number]>(
      dbVariants.map((v: typeof dbVariants[number]) => [v.id, v])
    );

    const enrichedItems = items
      .map((item: any) => {
        const dbVariant = variantMap.get(item.variantId);
        if (!dbVariant) return null;

        return {
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          name: dbVariant.product.name,
          variantName: dbVariant.name,
          sku: dbVariant.sku,
          price: parseFloat(dbVariant.price.toString()),
          specs: dbVariant.product.specs,
          category: dbVariant.product.category,
          stockAvailable: dbVariant.inventory?.stock ?? 0,
        };
      })
      .filter((item: any): item is any => item !== null);

    res.status(200).json({
      status: 'success',
      data: {
        items: enrichedItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const { items } = req.body;
    if (!Array.isArray(items)) {
      res.status(400).json({ status: 'fail', message: 'Cart items must be an array' });
      return;
    }
    const cartPayload = { items };

    const cartKey = `cart:${userId}`;
    let savedToCache = false;

    try {
      if (redisClient.isOpen) {
        await redisClient.setEx(cartKey, CART_TTL, JSON.stringify(cartPayload));
        savedToCache = true;
      } else {
        console.warn('Redis client is offline. Skipping cart save to cache.');
      }
    } catch (redisError) {
      console.error('Failed to save cart to Redis:', redisError);
    }

    res.status(200).json({
      status: 'success',
      message: savedToCache ? 'Cart updated successfully' : 'Cart updated (Redis offline)',
      data: cartPayload,
    });
  } catch (error) {
    next(error);
  }
};
