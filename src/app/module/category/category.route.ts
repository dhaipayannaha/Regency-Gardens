import { Router } from 'express';
import { CategoryController } from './category.contrller';
import { auth } from '../../middleware/checkAuth';
import { Role } from '../../../generated/prisma/enums';

const router = Router();

router.post('/create-category', auth(Role.ADMIN), CategoryController.createCategory);
router.get('/', auth(Role.AGENT, Role.ADMIN), CategoryController.getAllCategories);
router.get('/:id', auth(Role.AGENT, Role.ADMIN), CategoryController.getSingleCategory);
router.patch('/:id', auth(Role.ADMIN), CategoryController.updateCategory);
router.delete('/:id', auth(Role.ADMIN), CategoryController.deleteCategory);

export const CategoryRoutes = router;