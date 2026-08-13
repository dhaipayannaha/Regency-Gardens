import { Role } from "../../../generated/prisma/client";



export type RegisterUserPayload = {
    name: string;
    email: string;
    password: string;
    phone?: string;
    avatarUrl?: string;
    role?: Role;
};