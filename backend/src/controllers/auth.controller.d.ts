import { Request, Response, NextFunction } from 'express';
/** STUDENT SIGN‑UP */
export declare const studentSignup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** ALUMNI SIGN‑UP */
export declare const alumniSignup: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** CDC LOGIN */
export declare const cdcLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** COMMON LOGIN (any role) */
export declare const commonLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const studentLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const alumniLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** EMAIL VERIFICATION */
export declare const verifyEmail: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** FORGOT PASSWORD */
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
/** RESET PASSWORD */
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
