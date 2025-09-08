import { Router } from 'express';
import {
    createTweet,
    deleteTweet,
    getAllTweet,
    updateTweet,
} from '../controllers/tweet.controller.js';
import { JWTVerify } from '../middlewares/auth.controller.js';
const router = Router();

router.use(JWTVerify);
router.route('/create-tweet/:videoId').post(createTweet);
router.route('/get-all-tweets').get(getAllTweet);
router.route('/update-tweet/:tweetId').post(updateTweet);
router.route('/delete-tweet/:tweetId').get(deleteTweet);

export default router;
