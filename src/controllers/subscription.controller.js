import mongoose, { isValidObjectId } from 'mongoose';
import { User } from '../models/user.model.js';
import { Subscription } from '../models/subscriptions.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!channelId) {
        throw new apiError(400, 'ChannelId is required field');
    }

    // Prevent self-subscription
    if (req.user._id.toString() === channelId) {
        throw new apiError(400, 'You cannot subscribe to yourself');
    }

    // Check if already subscribed
    const alreadySubscribed = await Subscription.findOne({
        subscriber: req.user._id, // Login
        channel: channelId, // chai aur code
    });

    console.log('alreadySubscribed', alreadySubscribed);

    if (alreadySubscribed) {
        await Subscription.findOneAndDelete({
            subscriber: req.user._id,
            channel: channelId,
        });

        // console.log('already Subscribed', alreadySubscribed);
        return res.status(200).json(
            new apiResponse(200, null, 'Unsubsced successfully', {
                success: true,
            })
        );
    }

    // Subscribe
    const newSubscription = await Subscription.create({
        subscriber: req.user._id,
        channel: channelId,
    });

    return res.status(201).json(
        new apiResponse(201, newSubscription, 'Subscribed successfully', {
            success: true,
        })
    );
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    if (!isValidObjectId(channelId)) {
        throw new apiError(404, 'Channel Not Found!');
    }

    const subscriberInfo = await Subscription.find({
        channel: channelId,
    }).populate('subscriber', 'fullName userName email');
    res.status(200).json(
        new apiResponse(
            201,
            { subscriberInfo, totalSubscriber: subscriberInfo.length },
            'Subscriber Details Fetched Successfully'
        )
    );
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;
    const channelInfo = await Subscription.find({
        subscriber: subscriberId,
    }).populate('channel', 'userName email fullName');
    res.status(200).json(
        new apiResponse(
            200,
            { channelInfo, totalChannelSubscribed: channelInfo.length },
            'Channel Details fetched successfully'
        )
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
