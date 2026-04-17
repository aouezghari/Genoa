import express from 'express';
import { addNodeToTree, getTreeMembers, updateMemberInTree ,deleteMemberFromTree, getTreeStats } from '../controllers/tree.controller.js';
import { verifyUser } from '../middlewares/auth.middleware.js';
import { attachUserTree, requireEditor} from '../middlewares/tree.middleware.js';

const router = express.Router();

router.get('/members', verifyUser, attachUserTree, getTreeMembers);
router.get('/stats', verifyUser, attachUserTree, getTreeStats);
router.post('/members', verifyUser, attachUserTree, requireEditor, addNodeToTree);
router.put('/members/:nodeId', verifyUser, attachUserTree, requireEditor, updateMemberInTree);
router.delete('/members/:nodeId', verifyUser, attachUserTree, requireEditor, deleteMemberFromTree);

export default router;