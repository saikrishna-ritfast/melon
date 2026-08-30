import { z } from 'zod';

export const DrinkSpecsSchema = z.object({
  volumeMl: z.number().int().positive('Volume must be a positive integer'),
  ingredients: z.array(z.string()).min(1, 'Ingredients list cannot be empty'),
  sugarGrams: z.number().nonnegative('Sugar content cannot be negative'),
  caffeineMg: z.number().nonnegative('Caffeine content cannot be negative'),
  packagingType: z.enum(['CAN', 'BOTTLE', 'TETRA_PACK', 'GLASS_BOTTLE']),
});

export const BookSpecsSchema = z.object({
  isbn: z.string().regex(/^(97(8|9))?\d{9}(\d|X)$/, 'Invalid ISBN format'),
  author: z.string().min(1, 'Author is required'),
  publisher: z.string().min(1, 'Publisher is required'),
  pageCount: z.number().int().positive('Page count must be a positive integer'),
  language: z.string().min(2, 'Language must be at least 2 characters long'),
  publishYear: z.number().int().min(1000).max(new Date().getFullYear() + 1),
});

export const ProductSpecsSchema = z.union([DrinkSpecsSchema, BookSpecsSchema]);

export const ProductStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const ProductVariantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(1, 'SKU is required'),
  price: z.number().positive('Price must be greater than zero'),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
});

export const CreateProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Description is required'),
  categoryId: z.string().uuid('Invalid category ID'),
  status: ProductStatusSchema.default('ACTIVE'),
  specs: ProductSpecsSchema,
  variants: z.array(ProductVariantSchema).min(1, 'At least one variant is required'),
});