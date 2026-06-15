"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentService = void 0;
// src/services/student.service.ts
const prisma_1 = require("../lib/prisma");
const error_1 = require("../utils/error");
const cloudinary_1 = require("cloudinary");
const stream_1 = require("stream");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Configure Cloudinary if environment variables exist
const isCloudinaryConfigured = process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;
if (isCloudinaryConfigured) {
    cloudinary_1.v2.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
    });
}
const uploadFile = async (file, folder) => {
    if (isCloudinaryConfigured) {
        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary_1.v2.uploader.upload_stream({ folder: `alumniconnect/${folder}` }, (error, result) => {
                if (error)
                    return reject(error);
                resolve(result?.secure_url || '');
            });
            const readable = new stream_1.Readable();
            readable.push(file.buffer);
            readable.push(null);
            readable.pipe(uploadStream);
        });
    }
    else {
        // Local fallback storage
        const uploadsDir = path_1.default.join(process.cwd(), 'uploads');
        if (!fs_1.default.existsSync(uploadsDir)) {
            fs_1.default.mkdirSync(uploadsDir, { recursive: true });
        }
        // Create unique filename
        const ext = path_1.default.extname(file.originalname);
        const filename = `${folder}_${Date.now()}_${Math.round(Math.random() * 1e9)}${ext}`;
        const filePath = path_1.default.join(uploadsDir, filename);
        await fs_1.default.promises.writeFile(filePath, file.buffer);
        // Return backend server URL
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`;
        return `${backendUrl}/uploads/${filename}`;
    }
};
class StudentService {
    async getProfileByUserId(userId) {
        const profile = await prisma_1.prisma.studentProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        if (!profile) {
            throw new error_1.ApiError(404, 'Student profile not found');
        }
        return {
            id: profile.id,
            fullName: profile.fullName,
            email: profile.user.email,
            enrollmentNumber: profile.enrollmentNumber,
            branch: profile.branch,
            course: profile.course,
            graduationYear: profile.graduationYear,
            phone: profile.phone,
            bio: profile.bio,
            skills: profile.skills,
            linkedinUrl: profile.linkedinUrl,
            githubUrl: profile.githubUrl,
            resumeUrl: profile.resumeUrl,
            profileImage: profile.profileImage,
            isVerified: profile.isVerified,
        };
    }
    async updateProfile(userId, data, files) {
        const updateData = {};
        // Map fields
        if (data.fullName !== undefined)
            updateData.fullName = data.fullName;
        if (data.branch !== undefined)
            updateData.branch = data.branch;
        if (data.course !== undefined)
            updateData.course = data.course;
        if (data.graduationYear !== undefined)
            updateData.graduationYear = Number(data.graduationYear);
        if (data.bio !== undefined)
            updateData.bio = data.bio;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.linkedinUrl !== undefined)
            updateData.linkedinUrl = data.linkedinUrl;
        if (data.githubUrl !== undefined)
            updateData.githubUrl = data.githubUrl;
        // Handle skills parsing
        if (data.skills !== undefined) {
            if (Array.isArray(data.skills)) {
                updateData.skills = data.skills;
            }
            else if (typeof data.skills === 'string') {
                updateData.skills = data.skills
                    .split(',')
                    .map((s) => s.trim())
                    .filter(Boolean);
            }
        }
        // Handle file uploads
        if (files?.profileImage?.[0]) {
            updateData.profileImage = await uploadFile(files.profileImage[0], 'profiles');
        }
        if (files?.resume?.[0]) {
            updateData.resumeUrl = await uploadFile(files.resume[0], 'resumes');
        }
        const updatedProfile = await prisma_1.prisma.studentProfile.update({
            where: { userId },
            data: updateData,
            include: {
                user: {
                    select: {
                        email: true,
                    },
                },
            },
        });
        return {
            id: updatedProfile.id,
            fullName: updatedProfile.fullName,
            email: updatedProfile.user.email,
            enrollmentNumber: updatedProfile.enrollmentNumber,
            branch: updatedProfile.branch,
            course: updatedProfile.course,
            graduationYear: updatedProfile.graduationYear,
            phone: updatedProfile.phone,
            bio: updatedProfile.bio,
            skills: updatedProfile.skills,
            linkedinUrl: updatedProfile.linkedinUrl,
            githubUrl: updatedProfile.githubUrl,
            resumeUrl: updatedProfile.resumeUrl,
            profileImage: updatedProfile.profileImage,
            isVerified: updatedProfile.isVerified,
        };
    }
}
exports.StudentService = StudentService;
//# sourceMappingURL=student.service.js.map