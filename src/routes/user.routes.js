import {Router} from 'express';
import {userRegister} from '../controllers/user.controller.js';
import {upload} from '../middlewares/multer.middleware.js';

const router = Router();

router
    .route('/register', upload.fields([
        {name: 'avatar', maxCount: 1},
        {name: 'coverImage', maxCount: 1},
    ]))
    .post(userRegister);

export default router;
