/** Create email verification token (valid 24h) */
export declare const createEmailVerificationToken: (userId: string) => Promise<string>;
/** Verify email token and return userId */
export declare const verifyEmailToken: (token: string) => Promise<string>;
/** Create password reset token (valid 1h) */
export declare const createPasswordResetToken: (userId: string) => Promise<string>;
/** Verify password reset token and return userId */
export declare const verifyPasswordResetToken: (token: string) => Promise<string>;
