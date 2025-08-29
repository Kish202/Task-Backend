const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('User Routes', () => {
  let adminUser, memberUser, adminCookies, memberCookies;

  beforeEach(async () => {

    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin'
    });

    memberUser = await User.create({
      name: 'Member User',
      email: 'member@example.com',
      password: 'password123',
      role: 'member'
    });

    const adminLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@example.com',
        password: 'password123'
      });
    adminCookies = adminLogin.headers['set-cookie'];

    const memberLogin = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'member@example.com',
        password: 'password123'
      });
    memberCookies = memberLogin.headers['set-cookie'];
  });

  describe('GET /api/users', () => {
    it('should return all users for admin', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.users).toHaveLength(2);
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should deny access for member', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Cookie', memberCookies)
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });
  });

  describe('PATCH /api/users/:id/role', () => {
    it('should update user role as admin', async () => {
      const response = await request(app)
        .patch(`/api/users/${memberUser._id}/role`)
        .set('Cookie', adminCookies)
        .send({ role: 'admin' })
        .expect(200);

      expect(response.body.user.role).toBe('admin');
      expect(response.body.message).toBe('User role updated successfully');
    });

    it('should not allow admin to change own role', async () => {
      const response = await request(app)
        .patch(`/api/users/${adminUser._id}/role`)
        .set('Cookie', adminCookies)
        .send({ role: 'member' })
        .expect(400);

      expect(response.body.error).toBe('Cannot change your own role');
    });

    it('should deny access for member', async () => {
      const response = await request(app)
        .patch(`/api/users/${adminUser._id}/role`)
        .set('Cookie', memberCookies)
        .send({ role: 'member' })
        .expect(403);

      expect(response.body.error).toBe('Access denied. Insufficient permissions.');
    });
  });
});