
import AppError from '../../../errors/AppErrors';
import { prisma } from '../../lib/prisma';
import { IPropertyImage } from './property-image.interface';
import httpStatus from 'http-status';

const addPropertyImage = async (payload: IPropertyImage, userId: string) => {
    // Ensure the property exists and belongs to this agent
    const property = await prisma.property.findUnique({
        where: { id: payload.propertyId },
    });

    if (!property) {
        throw new AppError(httpStatus.NOT_FOUND, 'Property not found');
    }

    if (property.agentId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to add images to this property'
        );
    }

    const result = await prisma.propertyImage.create({
        data: payload,
    });
    return result;
};

const getImagesByProperty = async (propertyId: string) => {
    const result = await prisma.propertyImage.findMany({
        where: { propertyId },
    });
    return result;
};

const deletePropertyImage = async (id: string, userId: string) => {
    const image = await prisma.propertyImage.findUnique({
        where: { id },
        include: { property: true },
    });

    if (!image) {
        throw new AppError(httpStatus.NOT_FOUND, 'Image not found');
    }

    if (image.property.agentId !== userId) {
        throw new AppError(
            httpStatus.FORBIDDEN,
            'You are not authorized to delete this image'
        );
    }

    const result = await prisma.propertyImage.delete({
        where: { id },
    });
    return result;
};

export const PropertyImageService = {
    addPropertyImage,
    getImagesByProperty,
    deletePropertyImage,
};