
import httpStatus from 'http-status';
import { IReview } from './review.interface';
import { prisma } from '../../lib/prisma';
import AppError from '../../../errors/AppErrors';

const createReview = async (payload: IReview) => {
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    const existing = await prisma.review.findUnique({
        where: {
            userId_propertyId: {
                userId: payload.userId,
                propertyId: payload.propertyId,
            },
        },
    });

    if (existing) {
        throw new AppError(
            httpStatus.CONFLICT,
            'You have already reviewed this property'
        );
    }

    const result = await prisma.review.create({
        data: payload,
    });
    return result;
};

const getPropertyReviews = async (
    propertyId: string,
    options: { page?: string; limit?: string }
) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const result = await prisma.review.findMany({
        where: { propertyId },
        include: {
            user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    const total = await prisma.review.count({ where: { propertyId } });

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: result,
    };
};

const updateReview = async (
    id: string,
    payload: Partial<IReview>,
    userId: string
) => {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
    }

    if (review.userId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to update this review'
        );
    }

    const result = await prisma.review.update({
        where: { id },
        data: payload,
    });
    return result;
};

const deleteReview = async (id: string, userId: string) => {
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
        throw new AppError(httpStatus.NOT_FOUND, 'Review not found');
    }

    if (review.userId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to delete this review'
        );
    }

    const result = await prisma.review.delete({ where: { id } });
    return result;
};

export const ReviewService = {
    createReview,
    getPropertyReviews,
    updateReview,
    deleteReview,
};