import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { PropertyService } from './property.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';
import { ListingType, PropertyStatus } from '../../../generated/prisma/client';

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
    const filters = {
        city: req.query.city as string,
        listingType: req.query.listingType as ListingType,
        status: req.query.status as PropertyStatus,
        minPrice: req.query.minPrice as string,
        maxPrice: req.query.maxPrice as string,
        bedrooms: req.query.bedrooms as string,
        bathrooms: req.query.bathrooms as string,
        searchTerm: req.query.searchTerm as string,
    };

    const options = {
        page: req.query.page as string,
        limit: req.query.limit as string,
        sortBy: req.query.sortBy as string,
    };

    const result = await PropertyService.getAllProperties(filters, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Properties retrieved successfully',
        meta: result.meta,
        data: result.data,
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