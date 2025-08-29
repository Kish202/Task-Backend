const Task = require('../models/Task');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const getOverviewStats = async (req, res) => {
  try {
    let taskQuery = {};
    if (req.user.role !== 'admin') {
      taskQuery.$or = [
        { createdBy: req.user._id },
        { assignee: req.user._id }
      ];
    }

    const tasksByStatus = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const tasksByPriority = await Task.aggregate([
      { $match: taskQuery },
      { $group: { _id: '$priority', count: { $sum: 1 } } }
    ]);

    const overdueTasks = await Task.countDocuments({
      ...taskQuery,
      dueDate: { $lt: new Date() },
      status: { $ne: 'done' }
    });

    const totalTasks = await Task.countDocuments(taskQuery);

    let activityQuery = {};
    if (req.user.role !== 'admin') {
      activityQuery.userId = req.user._id;
    }

    const recentActivity = await ActivityLog.find(activityQuery)
      .populate('userId', 'name email')
      .populate('taskId', 'title')
      .sort({ timestamp: -1 })
      .limit(10);

    let userCount = null;
    if (req.user.role === 'admin') {
      userCount = await User.countDocuments();
    }

    res.json({
      tasksByStatus: tasksByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { todo: 0, 'in-progress': 0, done: 0 }),
      
      tasksByPriority: tasksByPriority.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, { low: 0, medium: 0, high: 0 }),
      
      overdueTasks,
      totalTasks,
      userCount,
      recentActivity,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOverviewStats,
};