

import AppError from '../../../errors/AppErrors';
import { Prisma } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';
import { IProperty, PropertyFilters } from './property.interface';
import httpStatus from 'http-status';

const createProperty = async (payload: IProperty) => {
    const { images, ...propertyData } = payload;
    
    const data: any = {
        ...propertyData,
    };

    if (images && images.length > 0) {
        data.images = {
            create: images.map((url, index) => ({
                url,
                isPrimary: index === 0,
            })),
        };
    }

    const result = await prisma.property.create({
        data,
        include: {
            images: true,
        },
    });
    return result;
};

const getAllProperties = async (
    filters: PropertyFilters,
    options: { page?: string; limit?: string; sortBy?: string }
) => {
    const { city, listingType, status, minPrice, maxPrice, bedrooms, bathrooms, searchTerm } = filters;

    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const andConditions: Prisma.PropertyWhereInput[] = [];

    if (searchTerm) {
        andConditions.push({
            OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { address: { contains: searchTerm, mode: 'insensitive' } },
            ],
        });
    }

    if (city) {
        andConditions.push({ city: { equals: city, mode: 'insensitive' } });
    }

    if (listingType) {
        andConditions.push({ listingType });
    }

    if (status) {
        andConditions.push({ status });
    }

    if (minPrice !== undefined) {
        andConditions.push({ price: { gte: minPrice } });
    }

    if (maxPrice !== undefined) {
        andConditions.push({ price: { lte: maxPrice } });
    }

    if (bedrooms !== undefined) {
        andConditions.push({ bedrooms: { gte: Number(bedrooms) } });
    }

    if (bathrooms !== undefined) {
        andConditions.push({ bathrooms: { gte: Number(bathrooms) } });
    }

    const whereConditions: Prisma.PropertyWhereInput =
        andConditions.length > 0 ? { AND: andConditions } : {};

    let orderBy: Prisma.PropertyOrderByWithRelationInput = { createdAt: 'desc' }; // default: newest first

    switch (options.sortBy) {
        case 'price_asc':
            orderBy = { price: 'asc' };
            break;
        case 'price_desc':
            orderBy = { price: 'desc' };
            break;
        case 'newest':
            orderBy = { createdAt: 'desc' };
            break;
        case 'oldest':
            orderBy = { createdAt: 'asc' };
            break;
        // 'most_reviewed' handled separately below since it needs a relation count
    }

    const result = await prisma.property.findMany({
        where: whereConditions,
        include: {
            agent: { select: { id: true, name: true, email: true } },
            category: true,
            images: true,
            _count: { select: { reviews: true } },
        },
        orderBy:
            options.sortBy === 'most_reviewed'
                ? { reviews: { _count: 'desc' } }
                : orderBy,
        skip,
        take: limit,
    });

    const total = await prisma.property.count({ where: whereConditions });

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: result,
    };
};

const getSingleProperty = async (idOrSlug: string) => {
    const property = await prisma.property.findFirst({
        where: {
            OR: [
                { id: idOrSlug },
                { slug: idOrSlug },
            ],
        },
        include: {
            agent: { select: { id: true, name: true, email: true } },
            category: true,
            images: true,
            reviews: {
                include: {
                    user: { select: { id: true, name: true } },
                },
                orderBy: { createdAt: 'desc' },
            },
        },
    });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    const aggregate = await prisma.review.aggregate({
        where: { propertyId: property.id },
        _avg: { rating: true },
        _count: { rating: true },
    });

    return {
        ...property,
        averageRating: aggregate._avg.rating
            ? Number(aggregate._avg.rating.toFixed(1))
            : 0,
        reviewCount: aggregate._count.rating,
    };
};

// const updateProperty = async (id: string, payload: Partial<IProperty>) => {
//     const result = await prisma.property.update({
//         where: { id },
//         data: payload,
//     });
//     return result;
// };

const updateProperty = async (
    id: string,
    payload: Partial<IProperty>,
    userId: string
) => {
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    if (property.agentId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to update this property'
        );
    }

    const result = await prisma.property.update({
        where: { id },
        data: payload,
    });
    return result;
};

// const deleteProperty = async (id: string) => {
//     const result = await prisma.property.delete({
//         where: { id },
//     });
//     return result;
// };

const deleteProperty = async (id: string, userId: string) => {
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    if (property.agentId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to delete this property'
        );
    }

    const result = await prisma.property.delete({
        where: { id },
    });
    return result;
};
const getMyProperties = async (
    agentId: string,
    options: { page?: string; limit?: string }
) => {
    const page = Number(options.page) || 1;
    const limit = Number(options.limit) || 10;
    const skip = (page - 1) * limit;

    const whereConditions = { agentId };

    const result = await prisma.property.findMany({
        where: whereConditions,
        include: {
            category: true,
            images: true,
            _count: { select: { reviews: true, inquiries: true, favorites: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    });

    const total = await prisma.property.count({ where: whereConditions });

    return {
        meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
        data: result,
    };
};

export const PropertyService = {
    createProperty,
    getAllProperties,
    getSingleProperty,
    updateProperty,
    deleteProperty,
    getMyProperties
};