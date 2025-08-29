const express = require('express');
const { validate, updateRoleSchema } = require('../middleware/validation');
const { getUsers, updateUserRole } = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');

const router = express.Router();

router.use(auth);
router.use(roleCheck(['admin']));

router.get('/', getUsers);
router.patch('/:id/role', validate(updateRoleSchema), updateUserRole);

module.exports = router;