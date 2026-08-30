import { z } from 'zod';
import { RegisterInputSchema, LoginInputSchema } from '../validation/auth';

export type RegisterInput = z.infer<typeof RegisterInputSchema>;
export type LoginInput = z.infer<typeof LoginInputSchema>;
