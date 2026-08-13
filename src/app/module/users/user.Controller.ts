import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { sendResponse } from '../../utils/sendResponse';
import { catchAsync } from '../../utils/catchAsync';
import { userService } from './user.services';

const registerUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = await userService.registerUserIntoDB(payload);
    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'User registered successfully',
        data: user,
    });
});

const getMyProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const profile = await userService.getMyProfileFromDB(userId);

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.OK,
        message: 'User profile fetched successfully',
        data: profile,
    });
});

const getUsers = catchAsync(async (req: Request, res: Response) => {
    const result = await userService.getAllUsersFromDB();

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Users retrieved successfully',
        data: result,
    });
});

const updateUserRole = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { role } = req.body;

    const result = await userService.updateUserRoleFromDB(id as string, role);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User role updated successfully',
        data: result,
    });
});

const deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await userService.deleteUserFromDB(id as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'User deleted successfully',
        data: result,
    });
});

export const UserController = {
    registerUser,
    getMyProfile,
    getUsers,
    updateUserRole,
    deleteUser,
};