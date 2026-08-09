
import AppError from '../../../errors/AppErrors';
import { prisma } from '../../lib/prisma';
import { IProperty } from './property.interface';
import httpStatus from 'http-status';

const createProperty = async (payload: IProperty) => {
    const result = await prisma.property.create({
        data: payload,
    });
    return result;
};

const getAllProperties = async () => {
    const result = await prisma.property.findMany({
        include: {
            agent: true,
            category: true,
            images: true,
        },
    });
    return result;
};

const getSingleProperty = async (id: string) => {
    const result = await prisma.property.findUnique({
        where: { id },
        include: {
            agent: true,
            category: true,
            images: true,
            reviews: true,
        },
    });
    return result;
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

export const PropertyService = {
    createProperty,
    getAllProperties,
    getSingleProperty,
    updateProperty,
    deleteProperty,
};