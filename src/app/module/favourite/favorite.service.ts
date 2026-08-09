
import httpStatus from 'http-status';
import { prisma } from '../../lib/prisma';
import AppError from '../../../errors/AppErrors';

const toggleFavorite = async (userId: string, propertyId: string) => {
    const property = await prisma.property.findUnique({
        where: { id: propertyId },
    });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    const existing = await prisma.favorite.findUnique({
        where: {
            userId_propertyId: {
                userId,
                propertyId,
            },
        },
    });

    if (existing) {
        await prisma.favorite.delete({
            where: { id: existing.id },
        });
        return { favorited: false };
    }

    await prisma.favorite.create({
        data: { userId, propertyId },
    });
    return { favorited: true };
};

const getMyFavorites = async (userId: string) => {
    const result = await prisma.favorite.findMany({
        where: { userId },
        include: {
            property: {
                include: { images: true },
            },
        },
    });
    return result;
};

export const FavoriteService = {
    toggleFavorite,
    getMyFavorites,
};