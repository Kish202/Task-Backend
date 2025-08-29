const express = require('express');
const { validate, taskSchema } = require('../middleware/validation');
const {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getTasks);
router.post('/', validate(taskSchema), createTask);
router.get('/:id', getTaskById);
router.put('/:id', validate(taskSchema), updateTask);
router.delete('/:id', deleteTask);

module.exports = router;