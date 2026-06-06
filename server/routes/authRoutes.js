import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/errorMiddleware.js';

const router = express.Router();

router.post('/register', asyncHandler(registerUser));
router.post('/login', asyncHandler(loginUser));

export default router;
