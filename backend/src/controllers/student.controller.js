"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateStudentProfile = exports.getStudentProfile = void 0;
const student_service_1 = require("../services/student.service");
const response_1 = require("../utils/response");
const studentService = new student_service_1.StudentService();
const getStudentProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profile = await studentService.getProfileByUserId(userId);
        (0, response_1.responseSuccess)(res, 'Profile fetched successfully', profile);
    }
    catch (err) {
        next(err);
    }
};
exports.getStudentProfile = getStudentProfile;
const updateStudentProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const files = req.files;
        const profile = await studentService.updateProfile(userId, req.body, files);
        (0, response_1.responseSuccess)(res, 'Profile updated successfully', profile);
    }
    catch (err) {
        next(err);
    }
};
exports.updateStudentProfile = updateStudentProfile;
//# sourceMappingURL=student.controller.js.map