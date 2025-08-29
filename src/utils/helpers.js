const ActivityLog = require('../models/ActivityLog');

const logActivity = async (taskId, userId, action, changes = {}) => {
  try {
    await ActivityLog.create({
      taskId,
      userId,
      action,
      changes,
    });
  } catch (error) {
    console.error('Failed to log activity:', error);
  }
};

const buildTaskQuery = (filters, user) => {
  let query = {};

  if (user.role !== 'admin') {
    query.$or = [
      { createdBy: user._id },
      { assignee: user._id }
    ];
  }

  if (filters.status) {
    query.status = filters.status;
  }

  if (filters.priority) {
    query.priority = filters.priority;
  }

  if (filters.assignee) {
    query.assignee = filters.assignee;
  }

  if (filters.dueDateFrom || filters.dueDateTo) {
    query.dueDate = {};
    if (filters.dueDateFrom) {
      query.dueDate.$gte = new Date(filters.dueDateFrom);
    }
    if (filters.dueDateTo) {
      query.dueDate.$lte = new Date(filters.dueDateTo);
    }
  }

  if (filters.search) {
    query.$and = query.$and || [];
    query.$and.push({
      $or: [
        { title: { $regex: filters.search, $options: 'i' } },
        { description: { $regex: filters.search, $options: 'i' } },
        { tags: { $in: [new RegExp(filters.search, 'i')] } }
      ]
    });
  }

  return query;
};

const getPaginationOptions = (page = 1, limit = 10) => {
  const parsedPage = parseInt(page);
  const parsedLimit = Math.min(parseInt(limit), 100); 
  const skip = (parsedPage - 1) * parsedLimit;

  return {
    skip,
    limit: parsedLimit,
    page: parsedPage,
  };
};

module.exports = {
  logActivity,
  buildTaskQuery,
  getPaginationOptions,
};