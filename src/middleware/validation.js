const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation Error',
        details: error.details.map(detail => detail.message)
      });
    }
    next();
  };
};

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).trim().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const taskSchema = Joi.object({
  title: Joi.string().min(1).max(200).trim().required(),
  description: Joi.string().max(1000).trim().allow(''),
  status: Joi.string().valid('todo', 'in-progress', 'done'),
  priority: Joi.string().valid('low', 'medium', 'high'),
  dueDate: Joi.date().min('now').allow(null),
  tags: Joi.array().items(Joi.string().max(50).trim()),
  assignee: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).allow(null),
});

const updateRoleSchema = Joi.object({
  role: Joi.string().valid('admin', 'member').required(),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  taskSchema,
  updateRoleSchema,
};