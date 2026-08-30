import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma } from '../services/db.service';
import { redisClient } from '../services/redis.service';
import { Prisma } from '@prisma/client';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const { shippingAddress, billingAddress, paymentMethod, cartItems } = req.body;
    if (!shippingAddress || !billingAddress || !paymentMethod || !Array.isArray(cartItems) || cartItems.length === 0) {
      res.status(400).json({ status: 'fail', message: 'Invalid order input data' });
      return;
    }

    // Run order creation inside a transaction
    const order = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let calculatedTotal = 0;
      const itemsToCreate = [];

      for (const item of cartItems) {
        // Fetch variant with its inventory
        const variant = await tx.productVariant.findUnique({
          where: { id: item.variantId },
          include: { inventory: true },
        });

        if (!variant) {
          throw new Error(`Product variant with ID ${item.variantId} not found`);
        }

        if (!variant.inventory) {
          throw new Error(`Inventory record for SKU ${variant.sku} is missing`);
        }

        // Concurrency-safe atomic stock check and reserve.
        // updateMany updates the row only if stock is greater than or equal to requested quantity.
        const updateResult = await tx.inventory.updateMany({
          where: {
            variantId: item.variantId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Insufficient stock for ${variant.name} (${variant.sku}). Available: ${variant.inventory.stock}, Requested: ${item.quantity}`
          );
        }

        const itemPrice = parseFloat(variant.price.toString());
        calculatedTotal += itemPrice * item.quantity;

        itemsToCreate.push({
          variant: { connect: { id: item.variantId } },
          quantity: item.quantity,
          price: variant.price, // Store the price at purchase time
        });
      }

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          status: 'PENDING',
          totalAmount: calculatedTotal,
          shippingAddress: shippingAddress as any,
          billingAddress: billingAddress as any,
          paymentMethod,
          paymentStatus: 'UNPAID',
          items: {
            create: itemsToCreate,
          },
        },
        include: {
          items: {
            include: {
              variant: true,
            },
          },
        },
      });

      return newOrder;
    });

    // Clear cart in Redis on successful order (resilient check)
    try {
      if (redisClient.isOpen) {
        const cartKey = `cart:${userId}`;
        await redisClient.del(cartKey);
      }
    } catch (redisError) {
      console.error('Failed to clear cart in Redis on checkout:', redisError);
    }

    res.status(201).json({
      status: 'success',
      message: 'Order created and inventory reserved successfully',
      data: order,
    });
  } catch (error: any) {
    // Return a structured error response for user inventory error or database exceptions
    res.status(400).json({
      status: 'fail',
      message: error.message || 'Failed to place order due to system exception',
    });
  }
};

export const getOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ status: 'fail', message: 'Unauthorized' });
      return;
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      status: 'success',
      data: orders,
    });
  } catch (error) {
    next(error);
  }
};
