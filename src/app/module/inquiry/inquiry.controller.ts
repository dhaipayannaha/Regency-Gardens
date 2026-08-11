import { Request, Response } from 'express';
import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import { InquiryService } from './inquiry.service';
import { sendResponse } from '../../utils/sendResponse';

const createInquiry = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;
    const payload = { ...req.body, userId };

    const result = await InquiryService.createInquiry(payload);

    sendResponse(res, {
        statusCode: httpStatus.CREATED,
        success: true,
        message: 'Inquiry sent successfully',
        data: result,
    });
});

const getMyInquiries = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.userId as string;

    const options = {
        page: req.query.page as string,
        limit: req.query.limit as string,
    };

    const result = await InquiryService.getMyInquiries(userId, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Your inquiries retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const getReceivedInquiries = catchAsync(async (req: Request, res: Response) => {
    const agentId = req.user?.userId as string;

    const options = {
        page: req.query.page as string,
        limit: req.query.limit as string,
    };

    const result = await InquiryService.getReceivedInquiries(agentId, options);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Received inquiries retrieved successfully',
        meta: result.meta,
        data: result.data,
    });
});

const deleteInquiry = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const userId = req.user?.userId as string;

    const result = await InquiryService.deleteInquiry(id as string, userId as string);

    sendResponse(res, {
        statusCode: httpStatus.OK,
        success: true,
        message: 'Inquiry deleted successfully',
        data: result,
    });
});

export const InquiryController = {
    createInquiry,
    getMyInquiries,
    getReceivedInquiries,
    deleteInquiry,
};