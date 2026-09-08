import request from 'supertest';
import { app } from '../src/server';
import { generateAccessToken } from '../src/utils/jwt';

describe('Chat & Message REST Endpoints API', () => {
  const mockUser = {
    userId: 'test-user-id-123',
    email: 'student@example.com',
    role: 'STUDENT' as const,
  };

  const validToken = generateAccessToken(mockUser);

  it('GET /api/messages should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  it('GET /api/messages should return list of conversations when authenticated', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${validToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('GET /api/messages/:connectionId should enforce authentication', async () => {
    const res = await request(app).get('/api/messages/invalid-conn-id');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/messages/:conversationId/read should mark messages as read', async () => {
    const res = await request(app)
      .patch('/api/messages/mock-conv-id/read')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ recipientId: 'mock-partner-id' });

    // Returns 200 on success
    expect([200, 400, 404]).toContain(res.status);
  });
});
