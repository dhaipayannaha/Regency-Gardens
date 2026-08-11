import { z } from 'zod';

const createReviewValidation = z.object({
    body: z.object({
        rating: z
            .number({ error: 'Rating is required' })
            .int()
            .min(1, 'Rating must be at least 1')
            .max(5, 'Rating cannot exceed 5'),
        comment: z.string().optional(),
        propertyId: z.string({ error: 'propertyId is required' }),
    }),
});

export const ReviewValidation = {
    createReviewValidation,
};