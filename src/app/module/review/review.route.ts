import { Router } from 'express';
import { ReviewController } from './review.controller';
import { auth } from '../../middleware/checkAuth';
import validateRequest from './validateRequest';
import { ReviewValidation } from './review.validation';

const router = Router();

router.post('/', auth(), ReviewController.createReview);
router.get('/:propertyId', ReviewController.getPropertyReviews);
router.patch('/:id', auth(), ReviewController.updateReview);
router.delete('/:id', auth(), ReviewController.deleteReview);
router.post(
    '/',
    auth(),
    validateRequest(ReviewValidation.createReviewValidation),
    ReviewController.createReview
);

export const ReviewRoutes = router;