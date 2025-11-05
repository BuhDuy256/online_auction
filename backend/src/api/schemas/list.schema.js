import { z } from 'zod';

export const newListSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters'),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional().default('active'),
});

export const updateListSchema = z.object({
    title: z.string().min(1, 'Title is required').max(255, 'Title must be less than 255 characters').optional(),
    description: z.string().optional(),
    status: z.enum(['active', 'completed', 'archived']).optional(),
}).strict();

export const listSchemaType = z.infer(newListSchema);