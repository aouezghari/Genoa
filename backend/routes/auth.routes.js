import express from 'express';
import {
	signup,
	login,
	logout,
	forgotPassword,
	resetPassword,
	verifySession,
	getUserDetails,
	updateUserProfile,
	changePassword,
} from '../controllers/auth.controller.js';
import { upload } from '../middlewares/upload.middleware.js';
import {
	validateSignup,
	verifyUser,
	validateProfileUpdate,
	validatePasswordChange,
} from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/signup', upload.single('photo'), validateSignup, signup);
router.post('/login', login);
router.get('/logout', logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

router.get('/verify', verifyUser, verifySession);
router.get('/user/details', verifyUser, getUserDetails);
router.put('/user/profile', verifyUser, validateProfileUpdate, updateUserProfile);
router.put('/user/password', verifyUser, validatePasswordChange, changePassword);

export default router;