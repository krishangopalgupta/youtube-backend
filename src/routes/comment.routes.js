import { Router } from 'express';
import {
    createComment,
    deleteComment,
    getAllComment,
    updateComment,
} from '../controllers/comment.controller.js';
import { JWTVerify } from '../middlewares/auth.controller.js';
const router = Router();

router.use(JWTVerify);
router.route('/create-comment/:videoId').post(createComment);
router.route('/update-comment/:commentId').patch(updateComment);
router.route('/get-all-comments').get(getAllComment);
router.route('/delete-comment/:commentId').get(deleteComment);

export default router;
