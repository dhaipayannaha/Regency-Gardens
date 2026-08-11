import { z } from 'zod';

const createPropertyValidation = z.object({
    body: z.object({
        title: z.string({ error: 'Title is required' }).min(3),
        slug: z.string({ error: 'Slug is required' }),
        description: z.string({ error: 'Description is required' }).min(10),
        price: z.number({ error: 'Price is required' }).positive(),
        listingType: z.enum(['SALE', 'RENT']), // adjust to your actual enum values
        bedrooms: z.number().int().nonnegative(),
        bathrooms: z.number().int().nonnegative(),
        areaSqft: z.number().int().positive(),
        address: z.string(),
        city: z.string(),
        state: z.string(),
        country: z.string(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        agentId: z.string(),
        categoryId: z.string(),
    }),
});

const updatePropertyValidation = z.object({
    body: z.object({
        title: z.string().min(3).optional(),
        description: z.string().min(10).optional(),
        price: z.number().positive().optional(),
        status: z.enum(['ACTIVE', 'PENDING', 'SOLD', 'INACTIVE']).optional(), // adjust to your enum
        bedrooms: z.number().int().nonnegative().optional(),
        bathrooms: z.number().int().nonnegative().optional(),
    }),
});

export const PropertyValidation = {
    createPropertyValidation,
    updatePropertyValidation,
};