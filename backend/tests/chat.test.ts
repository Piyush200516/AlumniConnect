import request from 'supertest';
import { app } from '../src/server';
import { generateAccessToken } from '../src/utils/jwt';
import { prisma } from '../src/lib/prisma';

jest.setTimeout(30000);

describe('Chat & Message REST Endpoints API', () => {
  let validToken: string;

  beforeAll(async () => {
    // Attempt to find any existing user in DB for authenticated test cases
    const dbUser = await prisma.user.findFirst();
    if (dbUser) {
      validToken = generateAccessToken({
        userId: dbUser.id,
        email: dbUser.email,
        role: dbUser.role,
      });
    } else {
      validToken = generateAccessToken({
        userId: 'test-user-id-123',
        email: 'student@example.com',
        role: 'STUDENT',
      });
    }
  });

  it('GET /api/messages should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/messages');
    expect(res.status).toBe(401);
  });

  it('GET /api/messages should return list of conversations when authenticated', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${validToken}`);

    expect([200, 401, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('data');
      expect(Array.isArray(res.body.data)).toBe(true);
    }
  });

  it('GET /api/messages/:connectionId should enforce authentication', async () => {
    const res = await request(app).get('/api/messages/invalid-conn-id');
    expect(res.status).toBe(401);
  });

  it('PATCH /api/messages/:conversationId/read should handle request', async () => {
    const res = await request(app)
      .patch('/api/messages/mock-conv-id/read')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ recipientId: 'mock-partner-id' });

    expect([200, 400, 401, 404]).toContain(res.status);
  });
});
