import { z } from 'zod';
import {
  DrinkSpecsSchema,
  BookSpecsSchema,
  ProductSpecsSchema,
  ProductVariantSchema,
  CreateProductSchema,
} from '../validation/product';

export type DrinkSpecs = z.infer<typeof DrinkSpecsSchema>;
export type BookSpecs = z.infer<typeof BookSpecsSchema>;
export type ProductSpecs = z.infer<typeof ProductSpecsSchema>;
export type ProductVariantInput = z.infer<typeof ProductVariantSchema>;
export type CreateProductInput = z.infer<typeof CreateProductSchema>;
