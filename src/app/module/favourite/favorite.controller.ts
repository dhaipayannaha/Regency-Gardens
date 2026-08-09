import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { FavoriteService } from './favorite.service';
import { sendResponse } from '../../utils/sendResponse';

const toggleFavorite = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const { propertyId } = req.body;

    const result = await FavoriteService.toggleFavorite(userId, propertyId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: result.favorited
            ? 'Property added to favorites'
            : 'Property removed from favorites',
        data: result,
    });
});

const getMyFavorites = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const result = await FavoriteService.getMyFavorites(userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Favorites retrieved successfully',
        data: result,
    });
});

export const FavoriteController = {
    toggleFavorite,
    getMyFavorites,
};