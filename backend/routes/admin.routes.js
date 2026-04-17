import express from 'express';
import {
	getUsers,
	getUsersWithTreeRole,
	deleteUser,
	makeAdmin,
	validateUser,
	updateUserTreeRole,
} from '../controllers/admin.controller.js';
import {
	getTreeMembers,
	addNodeToTree,
	updateMemberInTree,
	deleteMemberFromTree,
} from '../controllers/tree.controller.js';
import { verifyUser, verifyAdmin } from '../middlewares/auth.middleware.js';
import { attachTreeByTargetUserForAdmin } from '../middlewares/tree.middleware.js';

const router = express.Router();

router.use(verifyUser, verifyAdmin);

router.get('/users', getUsers);
router.get('/users/tree-roles', getUsersWithTreeRole);
router.delete('/users/:id', deleteUser);
router.put('/users/:id/make-admin', makeAdmin);
router.put('/users/:id/validate', validateUser);
router.put('/users/:id/tree-role', updateUserTreeRole);

router.get('/trees/:userId/members', attachTreeByTargetUserForAdmin, getTreeMembers);
router.post('/trees/:userId/members', attachTreeByTargetUserForAdmin, addNodeToTree);
router.put('/trees/:userId/members/:nodeId', attachTreeByTargetUserForAdmin, updateMemberInTree);
router.delete('/trees/:userId/members/:nodeId', attachTreeByTargetUserForAdmin, deleteMemberFromTree);

export default router;