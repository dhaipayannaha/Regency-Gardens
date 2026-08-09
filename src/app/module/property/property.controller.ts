import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PropertyService } from './property.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createProperty = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await PropertyService.createProperty(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Property created successfully',
        data: result,
    });
});

const getAllProperties = catchAsync(async (req: Request, res: Response) => {
    const result = await PropertyService.getAllProperties();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Properties retrieved successfully',
        data: result,
    });
});

const getSingleProperty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await PropertyService.getSingleProperty(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Property retrieved successfully',
        data: result,
    });
});

const updateProperty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const userId = req.user?.userId;

    const result = await PropertyService.updateProperty(id as string, payload, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Property updated successfully',
        data: result,
    });
});

const deleteProperty = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;

    const result = await PropertyService.deleteProperty(id as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Property deleted successfully',
        data: result,
    });
});

export const PropertyController = {
    createProperty,
    getAllProperties,
    getSingleProperty,
    updateProperty,
    deleteProperty,
};