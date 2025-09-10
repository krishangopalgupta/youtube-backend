import { Router } from 'express';
import {
    deleteVideo,
    getAllVideos,
    getVideoById,
    publishAVideo,
    togglePublishStatus,
    updateVideo,
    updateViews,
    getIndividualChannelVideos
} from '../controllers/video.controller.js';
import { JWTVerify } from '../middlewares/auth.controller.js';
import { upload } from '../middlewares/multer.middleware.js';

const router = Router();

router.route('/get-all-videos').get(getAllVideos);

// Protected Routes
router.use(JWTVerify);
router.route('/publish-video').post(
    upload.fields([
        {
            name: 'thumbnail',
            maxCount: 1,
        },
        {
            name: 'videoFile',
            maxCount: 1,
        },
    ]),
    publishAVideo
);

router.route('/update-views/:videoId').get(updateViews);
router.route('/get-video-by-id/:videoId').get(getVideoById);
router
    .route('/update-video/:videoId')
    .post(upload.single('thumbnail'), updateVideo);
router.route('/delete-video/:videoId').get(deleteVideo);
router.route('/toggle-publish-status/:videoId').get(togglePublishStatus);
router.route('/individual-channels-video').get(getIndividualChannelVideos);
export default router;
