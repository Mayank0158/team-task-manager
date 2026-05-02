const Task = require('../models/Task');
const Project = require('../models/Project');

const createTask = async (req, res) => {
  try {
    const { title, description, dueDate, priority, project, assignedTo } = req.body;

    if (!title || !dueDate || !project) {
      return res.status(400).json({ message: 'Please fill in required fields' });
    }

    const proj = await Project.findById(project);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    if (proj.admin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Only admin can create tasks' });
    }

    const task = await Task.create({
      title,
      description: description || '',
      dueDate,
      priority: priority || 'medium',
      project,
      assignedTo: assignedTo || req.user._id,
    });

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const proj = await Project.findById(req.params.projectId);
    if (!proj) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const isAdmin = proj.admin.toString() === req.user._id.toString();

    let query = { project: req.params.projectId };
    if (!isAdmin) {
      query.assignedTo = req.user._id;
    }

    const tasks = await Task.find(query)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['todo', 'in-progress', 'done'].includes(status)) {
      return res.status(400).json({ message: 'Please provide a valid status' });
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const proj = await Project.findById(task.project);
    const isAdmin = proj && proj.admin.toString() === req.user._id.toString();
    const isAssigned = task.assignedTo && task.assignedTo.toString() === req.user._id.toString();

    if (!isAdmin && !isAssigned) {
      return res.status(403).json({ message: 'You can only update tasks assigned to you' });
    }

    task.status = status;
    await task.save();

    const populated = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('project', 'name');

    res.json(populated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userProjects = await Project.find({
      $or: [{ admin: req.user._id }, { members: req.user._id }],
    });

    const projectIds = userProjects.map((p) => p._id);

    const [totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, tasksPerUser] = await Promise.all([
      Task.countDocuments({ project: { $in: projectIds } }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'todo' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'in-progress' }),
      Task.countDocuments({ project: { $in: projectIds }, status: 'done' }),
      Task.countDocuments({ project: { $in: projectIds }, dueDate: { $lt: new Date() }, status: { $ne: 'done' } }),
      Task.aggregate([
        { $match: { project: { $in: projectIds } } },
        { $group: { _id: '$assignedTo', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
        { $project: { _id: 1, count: 1, name: '$user.name', email: '$user.email' } },
        { $sort: { count: -1 } },
      ]),
    ]);

    res.json({ totalTasks, todoTasks, inProgressTasks, doneTasks, overdueTasks, tasksPerUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { createTask, getTasksByProject, updateTaskStatus, getDashboardStats };
