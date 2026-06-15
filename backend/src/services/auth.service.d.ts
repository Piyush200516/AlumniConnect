import { Role } from '@prisma/client';
declare class AuthService {
    /** Student signup */
    studentSignup(payload: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    /** Alumni signup */
    alumniSignup(payload: any): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    /** Login (generic) */
    login(payload: any, forcedRole?: Role): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            role: import(".prisma/client").$Enums.Role;
        };
    }>;
    /** Verify email */
    verifyEmail(token: string): Promise<void>;
    /** Forgot password */
    forgotPassword(email: string): Promise<void>;
    /** Reset password */
    resetPassword(token: string, newPassword: string): Promise<void>;
}
export default AuthService;
