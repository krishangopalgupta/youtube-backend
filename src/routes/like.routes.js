import { Router } from 'express';
import { likeVideo, likeComment, getAllLikedVideos, getAllLikedVideosOfIndividualUser } from '../controllers/like.controller.js';

const router = Router();

router.route('/like-video/:videoId').get(likeVideo);
router.route('/like-comment/:commentId').get(likeComment);
router.route('/get-all-liked-videos').get(getAllLikedVideos)
router.route('/get-all-liked-video-by-an-individual-user').get(getAllLikedVideosOfIndividualUser)

export default router;