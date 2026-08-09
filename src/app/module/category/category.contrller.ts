import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { CategoryService } from './category.service';
import { catchAsync } from '../../utils/catchAsync';
import { sendResponse } from '../../utils/sendResponse';

const createCategory = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await CategoryService.createCategory(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Category created successfully',
        data: result,
    });
});

const getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const result = await CategoryService.getAllCategories();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Categories retrieved successfully',
        data: result,
    });
});

const getSingleCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.getSingleCategory(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category retrieved successfully',
        data: result,
    });
});

const updateCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const payload = req.body;
    const result = await CategoryService.updateCategory(id as string, payload);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category updated successfully',
        data: result,
    });
});

const deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const result = await CategoryService.deleteCategory(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Category deleted successfully',
        data: result,
    });
});

export const CategoryController = {
    createCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory,
};