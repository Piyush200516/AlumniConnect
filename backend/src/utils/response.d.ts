import { Response } from 'express';
interface ErrorPayload {
    success: false;
    message: string;
    errors?: any[];
}
export declare const responseSuccess: <T>(res: Response, message: string, data?: T) => Response<any, Record<string, any>>;
export declare const responseError: (res: Response, payload: ErrorPayload, statusCode?: number) => Response<any, Record<string, any>>;
export {};
