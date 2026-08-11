import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { ReviewService } from './review.service';
import { sendResponse } from '../../utils/sendResponse';

const createReview = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const payload = { ...req.body, userId };

    const result = await ReviewService.createReview(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Review submitted successfully',
        data: result,
    });
});

const getPropertyReviews = catchAsync(async (req: Request, res: Response) => {
    const { propertyId } = req.params;
    const options = {
        page: req.query.page as string,
        limit: req.query.limit as string,
    };

    const result = await ReviewService.getPropertyReviews(propertyId as string, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Reviews retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const updateReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;
    const payload = req.body;

    const result = await ReviewService.updateReview(id as string, payload, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review updated successfully',
        data: result,
    });
});

const deleteReview = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;

    const result = await ReviewService.deleteReview(id as string, userId);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Review deleted successfully',
        data: result,
    });
});

export const ReviewController = {
    createReview,
    getPropertyReviews,
    updateReview,
    deleteReview,
};