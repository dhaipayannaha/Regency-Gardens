import { Router } from 'express';
import { FavoriteController } from './favorite.controller';
import { auth } from '../../middleware/checkAuth';

const router = Router();

router.post('/toggle', auth(), FavoriteController.toggleFavorite);
router.get('/my-favorites', auth(), FavoriteController.getMyFavorites);

export const FavoriteRoutes = router;