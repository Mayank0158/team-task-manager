const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasksByProject,
  updateTaskStatus,
  getDashboardStats,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createTask);
router.get('/dashboard', protect, getDashboardStats);
router.get('/project/:projectId', protect, getTasksByProject);
router.patch('/:id/status', protect, updateTaskStatus);

module.exports = router;
