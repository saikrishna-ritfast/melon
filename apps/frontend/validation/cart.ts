import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  variantId: z.string().uuid('Invalid variant ID'),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
});

export const CartPayloadSchema = z.object({
  items: z.array(CartItemSchema),
});

export const AddressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State/Province is required'),
  postalCode: z.string().min(1, 'Postal code/ZIP is required'),
  country: z.string().min(2, 'Country is required'),
});

export const OrderIntentSchema = z.object({
  shippingAddress: AddressSchema,
  billingAddress: AddressSchema,
  paymentMethod: z.enum(['CREDIT_CARD', 'PAYPAL', 'STRIPE', 'COD']),
  cartItems: z.array(CartItemSchema).min(1, 'Order must contain at least one item'),
});