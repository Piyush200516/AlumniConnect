import { z } from 'zod';

export const sendConnectionSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID format'),
});

export const acceptConnectionSchema = z.object({
  connectionId: z.string().uuid('Invalid connection ID format'),
});

export const sendMessageSchema = z.object({
  receiverId: z.string().uuid('Invalid receiver ID format'),
  content: z.string().min(1, 'Message content cannot be empty'),
  imageUrl: z.string().url('Invalid image attachment URL').optional().or(z.literal('')),
});
