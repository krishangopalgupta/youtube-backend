import mongoose from 'mongoose';
import { Video } from '../models/video.model.js';
import { Subscription } from '../models/subscription.model.js';
import { Like } from '../models/like.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.

    // Total Videos On A Channel
    const videos = await Video.find({ owner: req.user?._id }).populate(
        'owner',
        'userName'
    );

    // Calculation Of Total Views Of A Channel
    // for (const video of videos) {
    //     sum += video.views;
    // }

    // second method
    let sum = 0;
    for (let i = 0; i < videos.length; i++) sum += videos[i].views;

    // Total Subscriber Of A Channel
    const totalSubscriber = await Subscription.find({ channel: req.user?._id });

    // Total Likes On A Channel
    // const totalLikes = await Like.countDocuments({ video: { $exists: true } });

    const videoStats = await Promise.all(
        videos.map(async (video) => {
            const individualLikes = await Like.countDocuments({
                video: video._id,
            });
            return {
                videoId: video._id,
                title: video.title,
                totalViews: video.views,
                totalLikes: individualLikes,
            };
        })
    );

    const totalLikes = videoStats.reduce((acc, v) => acc + v.totalLikes, 0);

    // overall totalViews
    const overallViews = videos.reduce((acc, v) => acc + v.views, 0);

    res.status(200).json(
        new apiResponse(
            200,
            {
                videos: videoStats, // individual video stats array
                totalVideos: videos.length,
                totalViews: overallViews,
                subscribers: totalSubscriber.length,
                totalLikes: totalLikes, // overall likes (optional)
            },
            'Total Number of Videos Uploaded by an individual User'
        )
    );
});

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
});

export { getChannelStats, getChannelVideos };
