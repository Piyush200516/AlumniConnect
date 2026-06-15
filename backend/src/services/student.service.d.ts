export declare class StudentService {
    getProfileByUserId(userId: string): Promise<{
        id: string;
        fullName: string;
        email: string;
        enrollmentNumber: string;
        branch: string;
        course: string;
        graduationYear: number;
        phone: string | null;
        bio: string | null;
        skills: string[];
        linkedinUrl: string | null;
        githubUrl: string | null;
        resumeUrl: string | null;
        profileImage: string | null;
        isVerified: boolean;
    }>;
    updateProfile(userId: string, data: any, files?: {
        profileImage?: Express.Multer.File[];
        resume?: Express.Multer.File[];
    }): Promise<{
        id: string;
        fullName: string;
        email: string;
        enrollmentNumber: string;
        branch: string;
        course: string;
        graduationYear: number;
        phone: string | null;
        bio: string | null;
        skills: string[];
        linkedinUrl: string | null;
        githubUrl: string | null;
        resumeUrl: string | null;
        profileImage: string | null;
        isVerified: boolean;
    }>;
}
