const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Task = require('../src/models/Task');

describe('Task Routes', () => {
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

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description',
        priority: 'high',
        status: 'todo'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('Cookie', memberCookies)
        .send(taskData)
        .expect(201);

      expect(response.body.message).toBe('Task created successfully');
      expect(response.body.task.title).toBe(taskData.title);
      expect(response.body.task.createdBy._id).toBe(memberUser._id.toString());
    });

    it('should not create task without authentication', async () => {
      const taskData = {
        title: 'Test Task',
        description: 'Test Description'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.error).toBe('Access denied. No token provided.');
    });
  });

  describe('GET /api/tasks', () => {
    beforeEach(async () => {

      await Task.create({
        title: 'Admin Task',
        description: 'Admin task description',
        createdBy: adminUser._id
      });

      await Task.create({
        title: 'Member Task',
        description: 'Member task description',
        createdBy: memberUser._id
      });
    });

    it('should return all tasks for admin', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.tasks).toHaveLength(2);
      expect(response.body.pagination.totalItems).toBe(2);
    });

    it('should return only user tasks for member', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Cookie', memberCookies)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].title).toBe('Member Task');
    });

    it('should filter tasks by status', async () => {
      await Task.create({
        title: 'Done Task',
        status: 'done',
        createdBy: adminUser._id
      });

      const response = await request(app)
        .get('/api/tasks?status=done')
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.tasks).toHaveLength(1);
      expect(response.body.tasks[0].status).toBe('done');
    });
  });

  describe('PUT /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        description: 'Test Description',
        createdBy: memberUser._id
      });
    });

    it('should update own task', async () => {
      const updateData = {
        title: 'Updated Task',
        status: 'in-progress'
      };

      const response = await request(app)
        .put(`/api/tasks/${task._id}`)
        .set('Cookie', memberCookies)
        .send(updateData)
        .expect(200);

      expect(response.body.task.title).toBe('Updated Task');
      expect(response.body.task.status).toBe('in-progress');
    });

    it('should not allow member to update another user task', async () => {
      const adminTask = await Task.create({
        title: 'Admin Task',
        createdBy: adminUser._id
      });

      const response = await request(app)
        .put(`/api/tasks/${adminTask._id}`)
        .set('Cookie', memberCookies)
        .send({ title: 'Hacked Task' })
        .expect(404);

      expect(response.body.error).toBe('Task not found or access denied');
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    let task;

    beforeEach(async () => {
      task = await Task.create({
        title: 'Test Task',
        createdBy: memberUser._id
      });
    });

    it('should delete own task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Cookie', memberCookies)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');

      const deletedTask = await Task.findById(task._id);
      expect(deletedTask).toBeNull();
    });

    it('should allow admin to delete any task', async () => {
      const response = await request(app)
        .delete(`/api/tasks/${task._id}`)
        .set('Cookie', adminCookies)
        .expect(200);

      expect(response.body.message).toBe('Task deleted successfully');
    });
  });
});