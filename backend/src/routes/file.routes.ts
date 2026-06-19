import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { authenticateUser } from '../middleware/auth.middleware';
import { uploadFile } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { ApiError } from '../utils/error';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

router.post('/upload', authenticateUser as any, upload.single('file') as any, async (req: any, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'No file uploaded');
    }
    
    // Determine folder
    const folder = req.user?.role === 'ALUMNI' ? 'alumni_resources' : 'student_shared';
    const fileUrl = await uploadFile(req.file, folder);

    return responseSuccess(res, 'File uploaded successfully', {
      fileUrl,
      fileName: req.file.originalname,
      fileType: req.file.mimetype,
      fileSize: req.file.size
    });
  } catch (err) {
    next(err);
  }
});

export default router;
