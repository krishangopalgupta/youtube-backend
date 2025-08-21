import {Router} from 'express';
import {registerUser} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';

const router = Router();
// router
//     .route('/register', upload.fields([
//         {name: 'avatarImage', maxCount: 1},
//         {name: 'coverImage', maxCount: 1},
//     ]))
//     .post(userRegister);


router.route("/register").post(
    upload.fields([
        {
            name: "avatarImage",
            maxCount: 1
        }, 
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
    )
export default router;
