import bcrypt from 'bcryptjs';
// adjust to your actual prisma client path
import { RegisterUserPayload } from './user.interface';
import httpStatus from 'http-status';
import AppError from '../../../errors/AppErrors';
import { Role } from '../../../generated/prisma/client';
import { prisma } from '../../lib/prisma';

const registerUserIntoDB = async (payload: RegisterUserPayload) => {
    const { name, email, password, phone, avatarUrl, role } = payload;

    if (role && role !== Role.USER && role !== Role.AGENT) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            'Only USER or AGENT roles are allowed during registration'
        );
    }

    const isUserExist = await prisma.user.findUnique({ where: { email } });

    if (isUserExist) {
        throw new AppError(httpStatus.CONFLICT, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(
        password,
        Number(process.env.BCRYPT_SALT_ROUNDS) || 10
    );

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
            phone,
            avatarUrl,
            ...(role && { role }),
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            role: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return user;
};

const getMyProfileFromDB = async (id: string) => {
    const user = await prisma.user.findUnique({
        where: { id },
        omit: { password: true },
    });

    if (!user) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    return user;
};

const getAllUsersFromDB = async () => {
    const users = await prisma.user.findMany({
        omit: { password: true },
        orderBy: { createdAt: 'desc' },
    });
    return users;
};

const updateUserRoleFromDB = async (id: string, role: Role) => {
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const user = await prisma.user.update({
        where: { id },
        data: { role },
        omit: { password: true },
    });
    return user;
};

const deleteUserFromDB = async (id: string) => {
    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser) {
        throw new AppError(httpStatus.NOT_FOUND, 'User not found');
    }

    const user = await prisma.user.delete({ where: { id } });
    return user;
};

export const userService = {
    registerUserIntoDB,
    getMyProfileFromDB,
    getAllUsersFromDB,
    updateUserRoleFromDB,
    deleteUserFromDB,
};