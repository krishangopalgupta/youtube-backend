import { Router } from 'express';
import {
    changeCurrentPassword,
    getCurrentUser,
    getUserChannelProfile,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
} from '../controllers/user.controller.js';
import { upload } from '../middlewares/multer.middleware.js';
import { JWTVerify } from '../middlewares/auth.controller.js';

const router = Router();

router.route('/register').post(
    upload.fields([
        {
            name: 'avatarImage',
            maxCount: 1,
        },
        {
            name: 'coverImage',
            maxCount: 1,
        },
    ]),
    registerUser
);
router.route('/login').post(loginUser);

// Secure routes
router.route('/logout').post(JWTVerify, logoutUser);
router.route('/refresh-token').post(refreshAccessToken);
router.route('/update-password').post(JWTVerify, changeCurrentPassword);
// router.route('/current-user').get(JWTVerify, getCurrentUser);
router
    .route('/avatar')
    .patch(JWTVerify, upload.single('avatarImage'), updateUserAvatar);
router
    .route('/coverImage')
    .patch(JWTVerify, upload.single('coverImage'), updateUserCoverImage);

router.route('/current-user').get(JWTVerify, getCurrentUser)
// because we're using req.params
router.route('/c/:username').get(JWTVerify, getUserChannelProfile);
router.route('/update-account-details').patch(JWTVerify, updateAccountDetails);

export default router;