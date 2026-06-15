import { Role } from '@prisma/client';
export interface JwtPayloadData {
    userId: string;
    email: string;
    role: Role;
}
export declare const generateAccessToken: (payload: JwtPayloadData) => string;
export declare const generateRefreshToken: (payload: JwtPayloadData) => Promise<string>;
export declare const verifyAccessToken: (token: string) => JwtPayloadData;
