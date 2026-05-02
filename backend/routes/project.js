const express = require('express');
const router = express.Router();
const { createProject, getProjects, getProject, addMember, removeMember } = require('../controllers/projectController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createProject);
router.get('/', protect, getProjects);
router.get('/:id', protect, getProject);
router.post('/:id/members', protect, addMember);
router.delete('/:id/members/:userId', protect, removeMember);

module.exports = router;
