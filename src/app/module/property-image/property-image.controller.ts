import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { PropertyImageService } from './property-image.service';
import { sendResponse } from '../../utils/sendResponse';

const addPropertyImage = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const userId = req.user?.userId as string;

    const result = await PropertyImageService.addPropertyImage(payload, userId);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Image added successfully',
        data: result,
    });
});

const getImagesByProperty = catchAsync(async (req: Request, res: Response) => {
    const { propertyId } = req.params;

    const result = await PropertyImageService.getImagesByProperty(propertyId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Images retrieved successfully',
        data: result,
    });
});

const deletePropertyImage = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;

    const result = await PropertyImageService.deletePropertyImage(id as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Image deleted successfully',
        data: result,
    });
});

export const PropertyImageController = {
    addPropertyImage,
    getImagesByProperty,
    deletePropertyImage,
};