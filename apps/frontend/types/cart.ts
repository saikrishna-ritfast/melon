import { z } from 'zod';
import {
  CartItemSchema,
  CartPayloadSchema,
  AddressSchema,
  OrderIntentSchema,
} from '../validation/cart';

export type CartItem = z.infer<typeof CartItemSchema>;
export type CartPayload = z.infer<typeof CartPayloadSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type OrderIntent = z.infer<typeof OrderIntentSchema>;
