
import httpStatus from 'http-status';
import { IInquiry } from './inquiry.interface';
import { prisma } from '../../lib/prisma';
import AppError from '../../../errors/AppErrors';

const createInquiry = async (payload: IInquiry) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    const result = await prisma.inquiry.create({
        data: payload,
    });
    return result;
};

// Inquiries the logged-in user has sent
const getMyInquiries = async (
    userId: string,
    options: { page?: string; limit?: string }
) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await prisma.inquiry.findMany({
        where: { userId },
        include: {
            property: {
                include: { images: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    const total = await prisma.inquiry.count({ where: { userId } });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};

// Inquiries received on properties owned by the logged-in agent
const getReceivedInquiries = async (
    agentId: string,
    options: { page?: string; limit?: string }
) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const whereConditions = {
        property: {
            agentId,
        },
    };

    const result = await prisma.inquiry.findMany({
        where: whereConditions,
        include: {
            property: true,
            user: {
                select: { id: true, name: true, email: true },
            },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    const total = await prisma.inquiry.count({ where: whereConditions });

    return {
        meta: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
        data: result,
    };
};

const deleteInquiry = async (id: string, userId: string) => {
    const inquiry = await prisma.inquiry.findUnique({ where: { id } });

    if (!inquiry) {
        throw new AppError(httpStatus.NOT_FOUND, 'Inquiry not found');
    }

    if (inquiry.userId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to delete this inquiry'
        );
    }

    const result = await prisma.inquiry.delete({ where: { id } });
    return result;
};

export const InquiryService = {
    createInquiry,
    getMyInquiries,
    getReceivedInquiries,
    deleteInquiry,
};