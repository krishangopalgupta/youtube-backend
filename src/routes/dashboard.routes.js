import {Router} from 'express'
import {JWTVerify} from '../middlewares/auth.controller.js'
import { getChannelStats } from '../controllers/dashboard.controller.js';
const router = Router();


router.use(JWTVerify);
router.route('/channel-stats').get(getChannelStats);

export default router;