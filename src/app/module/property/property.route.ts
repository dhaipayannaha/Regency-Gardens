import { Router } from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';
import validateRequest from '../review/validateRequest';
import { PropertyValidation } from './property.validation';

const router = Router();

router.post('/create-property', auth(Role.AGENT), PropertyController.createProperty);
router.get('/', PropertyController.getAllProperties);
router.get('/my-properties', auth(Role.AGENT), PropertyController.getMyProperties);
router.get('/:id', PropertyController.getSingleProperty);
router.patch('/:id', auth(Role.AGENT), PropertyController.updateProperty);
router.delete('/:id', auth(Role.AGENT), PropertyController.deleteProperty);
router.post(
    '/create-property',
    auth(),
    validateRequest(PropertyValidation.createPropertyValidation),
    PropertyController.createProperty
);

router.patch(
    '/:id',
    auth(),
    validateRequest(PropertyValidation.updatePropertyValidation),
    PropertyController.updateProperty
);

export const PropertyRoutes = router;