import { Router } from 'express';
import { PropertyImageController } from './property-image.controller';
import { auth } from '../../middleware/checkAuth';

const router = Router();

router.post('/', auth(), PropertyImageController.addPropertyImage);
router.get('/:propertyId', PropertyImageController.getImagesByProperty);
router.delete('/:id', auth(), PropertyImageController.deletePropertyImage);

export const PropertyImageRoutes = router;