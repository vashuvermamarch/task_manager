import Task from '../models/Task.js';

// @desc    Get all tasks for logged-in user (with search, filter, pagination)
// @route   GET /api/tasks
// @access  Private
export const getTasks = async (req, res) => {
  try {
    const { search, status, page = 1, limit = 6, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { userId: req.user._id };

    // Search query
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build sort options
    const sortOptions = {};
    sortOptions[sortBy] = order === 'asc' ? 1 : -1;

    const totalTasks = await Task.countDocuments(query);
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum);

    res.json({
      tasks,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalTasks / limitNum),
        totalTasks,
      },
    });
  } catch (error) {
    res.status(500);
    throw new Error('Server Error fetching tasks');
  }
};

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
export const createTask = async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  if (!title) {
    res.status(400);
    throw new Error('Task title is required');
  }

  try {
    const task = await Task.create({
      title,
      description: description || '',
      status: status || 'pending',
      dueDate: dueDate || null,
      userId: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500);
    throw new Error('Server Error creating task');
  }
};

// @desc    Update task details
// @route   PUT /api/tasks/:id
// @access  Private
export const updateTask = async (req, res) => {
  const { title, description, status, dueDate } = req.body;

  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Verify task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this task');
    }

    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
};

// @desc    Quick toggle task status
// @route   PATCH /api/tasks/:id/status
// @access  Private
export const toggleTaskStatus = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Verify task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this task');
    }

    task.status = task.status === 'completed' ? 'pending' : 'completed';

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Verify task ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('Not authorized to access this task');
    }

    await task.deleteOne();
    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    if (res.statusCode === 200) res.status(500);
    throw error;
  }
};
