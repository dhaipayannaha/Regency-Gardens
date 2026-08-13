import { Router } from 'express';
import { Role } from '../../../generated/prisma/client';
import { auth } from '../../middleware/checkAuth';
import { UserController } from './user.Controller';

const router = Router();

router.post('/register', UserController.registerUser);

router.get(
    '/me',
    auth(Role.USER, Role.AGENT, Role.ADMIN),
    UserController.getMyProfile
);

router.get('/', auth(Role.ADMIN), UserController.getUsers);

router.patch('/:id/role', auth(Role.ADMIN), UserController.updateUserRole);

router.delete('/:id', auth(Role.ADMIN), UserController.deleteUser);

export const userRoutes = router;