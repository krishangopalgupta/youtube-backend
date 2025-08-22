import {Router} from 'express';
import {
    loginUser,
    logoutUser,
    registerUser,
} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';
import {JWTVerify} from '../middlewares/auth.controller.js';

const router = Router();
// router
//     .route('/register', upload.fields([
//         {name: 'avatarImage', maxCount: 1},
//         {name: 'coverImage', maxCount: 1},
//     ]))
//     .post(userRegister);

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
router.route('/logout').post(JWTVerify, logoutUser);
export default router;
