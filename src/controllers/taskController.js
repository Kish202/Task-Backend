const Task = require('../models/Task');
const { logActivity, buildTaskQuery, getPaginationOptions } = require('../utils/helpers');

const getTasks = async (req, res) => {
  try {
    const { page, limit, sort, ...filters } = req.query;
    
    const query = buildTaskQuery(filters, req.user);
    
    const { skip, limit: parsedLimit, page: currentPage } = getPaginationOptions(page, limit);
    
    let sortOptions = { createdAt: -1 }; 
    if (sort) {
      const [field, order] = sort.split(':');
      sortOptions = { [field]: order === 'desc' ? -1 : 1 };
    }

    const tasks = await Task.find(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email')
      .sort(sortOptions)
      .skip(skip)
      .limit(parsedLimit);

    const total = await Task.countDocuments(query);

    res.json({
      tasks,
      pagination: {
        currentPage,
        totalPages: Math.ceil(total / parsedLimit),
        totalItems: total,
        itemsPerPage: parsedLimit,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getTaskById = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id };
    
    if (req.user.role !== 'admin') {
      query.$or = [
        { createdBy: req.user._id },
        { assignee: req.user._id }
      ];
    }

    const task = await Task.findOne(query)
      .populate('assignee', 'name email')
      .populate('createdBy', 'name email');

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json({ task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      createdBy: req.user._id,
    };

    const task = await Task.create(taskData);
    await task.populate('assignee', 'name email');
    await task.populate('createdBy', 'name email');

    await logActivity(task._id, req.user._id, 'create', taskData);

    res.status(201).json({
      message: 'Task created successfully',
      task,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id };
    
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const existingTask = await Task.findOne(query);
    if (!existingTask) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    const updatedTask = await Task.findOneAndUpdate(
      query,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignee', 'name email')
     .populate('createdBy', 'name email');

    const changes = {};
    Object.keys(req.body).forEach(key => {
      if (existingTask[key] !== req.body[key]) {
        changes[key] = {
          from: existingTask[key],
          to: req.body[key]
        };
      }
    });

    await logActivity(id, req.user._id, 'update', changes);

    res.json({
      message: 'Task updated successfully',
      task: updatedTask,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    let query = { _id: id };
    
    if (req.user.role !== 'admin') {
      query.createdBy = req.user._id;
    }

    const task = await Task.findOneAndDelete(query);
    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    await logActivity(id, req.user._id, 'delete', { deletedTask: task.title });

    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};