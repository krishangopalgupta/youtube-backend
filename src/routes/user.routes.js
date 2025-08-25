import { Router } from 'express';
import {
    changeCurrentPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    registerUser,
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
export default router;
