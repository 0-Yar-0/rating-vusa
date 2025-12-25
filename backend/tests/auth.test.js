const request = require('supertest');
const app = require('../src/index');
const { prisma } = require('../src/db');

beforeAll(async () => {
  await prisma.$connect();
});

beforeEach(async () => {
  await prisma.calcResult.deleteMany();
  await prisma.params.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('Auth: change password', () => {
  test('user can change password and login with new password', async () => {
    const agent = request.agent(app);

    // register (also logs in)
    const r = await agent
      .post('/api/auth/register')
      .send({ name: 'Tester', email: 'test@example.com', password: 'oldpass' })
      .expect(200);
    expect(r.body.email).toBe('test@example.com');

    // change password
    const change = await agent
      .post('/api/auth/change-password')
      .send({ oldPassword: 'oldpass', newPassword: 'newpass' })
      .expect(200);
    expect(change.body.ok).toBe(true);

    // logout
    await agent.post('/api/auth/logout').expect(200);

    // old password should fail
    await agent.post('/api/auth/login').send({ email: 'test@example.com', password: 'oldpass' }).expect(400);

    // new password should succeed
    const login = await agent.post('/api/auth/login').send({ email: 'test@example.com', password: 'newpass' }).expect(200);
    expect(login.body.email).toBe('test@example.com');
  });
});