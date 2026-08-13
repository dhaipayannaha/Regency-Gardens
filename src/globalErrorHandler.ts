import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { Prisma } from '@prisma/client';
import AppError from '../errors/AppError';

const globalErrorHandler: ErrorRequestHandler = (error, req, res, next) => {
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorDetails: any = error;

    if (error instanceof AppError) {
        statusCode = error.statusCode;
        message = error.message;
    } else if (error instanceof ZodError) {
        statusCode = 400;
        message = 'Validation Error';
        errorDetails = error.errors.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
        }));
    } else if (error instanceof Prisma.PrismaClientKnownRequestError) {
        statusCode = 400;
        if (error.code === 'P2002') {
            message = `Duplicate value for field: ${error.meta?.target}`;
        } else if (error.code === 'P2025') {
            statusCode = 404;
            message = 'Record not found';
        } else {
            message = error.message;
        }
    } else if (error instanceof Error) {
        message = error.message;
    }

    res.status(statusCode).json({
        success: false,
        statusCode,
        message,
        error: errorDetails,
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
    });
};

export default globalErrorHandler;