import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Tweet } from '../models/tweet.model.js';
import { isValidObjectId } from 'mongoose';

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;

    if (!content) {
        throw new apiError(404, 'Content is required');
    }

    if (!isValidObjectId(videoId)) {
        throw new apiError(404, 'Video not found!');
    }

    const tweet = await Tweet.create({
        content,
        // owner will automatically fetch the id of the user from which it is referenced
        owner: req.user,
        video: videoId,
    });

    // const tweetInfo = await Tweet.findById(tweet?._id).populate(
    //     'owner',
    //     'userName fullName'
    // );
    res.status(201).json(
        new apiResponse(201, {}, 'Tweet Created Successfully')
    );
});

const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { tweetId } = req.params;
    if (!content) {
        throw new apiError(404, 'Content is required');
    }

    if (!isValidObjectId(tweetId)) {
        throw new apiError(404, 'content not found!');
    }

    const tweet = await Tweet.findById({ _id: tweetId });
    if (req.user?._id.toString() !== tweet.owner?.toString()) {
        throw new apiError(
            403,
            "You don't have authorization to update this Tweet"
        );
    }

    const updatedTweet = await Tweet.findByIdAndUpdate(
        { _id: tweetId },
        {
            $set: {
                content: content,
            },
        },
        { new: true }
    );
    res.status(201).json(
        new apiResponse(201, updatedTweet, 'Tweet Updated Successfully')
    );
});

const deleteTweet = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    if (!tweetId) {
        throw new apiError(404, 'Content is not found');
    }

    const tweet = await Tweet.findById({ _id: tweetId });
    if (!tweet) {
        throw new apiError(404, "this tweet either deleted or doesn't exist");
    }
    if (req.user?._id.toString() !== tweet.owner?.toString()) {
        throw new apiError(
            403,
            "You don't have authorization to delete this video"
        );
    }
    await tweet.deleteOne();

    res.status(200).json(
        new apiResponse(200, {}, 'Tweet deleted Successfully')
    );
});

const getAllTweet = asyncHandler(async (req, res) => {
    const tweet = await Tweet.find();

    res.status(200).json(
        new apiResponse(200, {tweet, totalTweets: tweet.length}, 'All Tweet fetched successfully')
    );


});

export { createTweet, updateTweet, deleteTweet, getAllTweet };
