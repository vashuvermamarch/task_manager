import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  toggleTaskStatus,
  deleteTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/authMiddleware.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

// Apply protect middleware to all task routes
router.use(protect);

router.route('/').get(asyncHandler(getTasks)).post(asyncHandler(createTask));
router.route('/:id').put(asyncHandler(updateTask)).delete(asyncHandler(deleteTask));
router.route('/:id/status').patch(asyncHandler(toggleTaskStatus));

export default router;
