import { Router } from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
} from '../controllers/subscription.controller.js';
import { JWTVerify } from '../middlewares/auth.controller.js';
const router = Router();

// router.use(JWTVerify);
router
    .route('/toggle-subscription/:channelId')
    .get(JWTVerify, toggleSubscription);
    
router
    .route('/subscribers/:channelId')
    .get(JWTVerify, getUserChannelSubscribers);
 

router
    .route('/subscribed-channels/:subscriberId')
    .get(JWTVerify, getSubscribedChannels);
 


    
export default router;
