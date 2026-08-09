import { Router } from 'express';
import { PropertyController } from './property.controller';
import { auth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post('/create-property', auth(Role.AGENT), PropertyController.createProperty);
router.get('/', PropertyController.getAllProperties);
router.get('/:id', PropertyController.getSingleProperty);
router.patch('/:id', auth(Role.AGENT), PropertyController.updateProperty);
router.delete('/:id', auth(Role.AGENT), PropertyController.deleteProperty);

export const PropertyRoutes = router;