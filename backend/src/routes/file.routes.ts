import { Router, Response, NextFunction } from 'express';
import { uploadAttachment } from '../middleware/upload';
import { authenticateUser } from '../middleware/auth.middleware';
import { uploadFile } from '../services/student.service';
import { responseSuccess } from '../utils/response';
import { ApiError } from '../utils/error';

const router = Router();

router.post('/upload', authenticateUser as any, uploadAttachment.single('file') as any, async (req: any, res: Response, next: NextFunction) => {
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
