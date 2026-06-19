import { Request, Response, NextFunction } from 'express';
import { AlumniService } from '../services/alumni.service';
import { ConnectionService } from '../services/connection.service';
import { MessageService } from '../services/message.service';
import { responseSuccess } from '../utils/response';
import { 
  sendConnectionSchema, 
  acceptConnectionSchema, 
  sendMessageSchema 
} from '../validators/alumni.validator';

const alumniService = new AlumniService();
const connectionService = new ConnectionService();
const messageService = new MessageService();

export const getAlumni = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const filters = req.query as any;
    const result = await alumniService.getAlumniList(filters, currentUserId);
    responseSuccess(res, 'Alumni list fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const getAlumniDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const alumniId = req.params.id as string;
    const details = await alumniService.getAlumniDetails(alumniId, currentUserId);
    responseSuccess(res, 'Alumni profile details fetched successfully', details);
  } catch (err) {
    next(err);
  }
};

export const searchAlumni = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const currentUserId = (req as any).user.id;
    const filters = req.query as any;
    const result = await alumniService.getAlumniList(filters, currentUserId);
    responseSuccess(res, 'Alumni search results fetched successfully', result);
  } catch (err) {
    next(err);
  }
};

export const sendConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.id;
    const validated = sendConnectionSchema.parse(req.body);
    const result = await connectionService.sendConnectionRequest(senderId, validated.receiverId);
    responseSuccess(res, result.message, result.connection);
  } catch (err) {
    next(err);
  }
};

export const acceptConnection = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const receiverId = (req as any).user.id;
    const validated = acceptConnectionSchema.parse(req.body);
    const connection = await connectionService.acceptConnectionRequest(receiverId, validated.connectionId);
    responseSuccess(res, 'Connection request accepted successfully', connection);
  } catch (err) {
    next(err);
  }
};

export const postMessage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const senderId = (req as any).user.id;
    const validated = sendMessageSchema.parse(req.body);
    const message = await messageService.sendMessage(senderId, {
      receiverId: validated.receiverId,
      content: validated.content
    });
    responseSuccess(res, 'Message sent successfully', message);
  } catch (err) {
    next(err);
  }
};

export const toggleFollow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const targetAlumniId = req.params.id as string;
    const result = await alumniService.toggleFollowAlumni(userId, targetAlumniId);
    responseSuccess(res, result.message, result);
  } catch (err) {
    next(err);
  }
};

export const toggleSave = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const targetAlumniId = req.params.id as string;
    const result = await alumniService.toggleSaveAlumniProfile(userId, targetAlumniId);
    responseSuccess(res, result.message, result);
  } catch (err) {
    next(err);
  }
};
