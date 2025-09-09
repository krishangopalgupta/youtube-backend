import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Like } from '../models/like.model.js';
import { isValidObjectId } from 'mongoose';

const likeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    if (!isValidObjectId(videoId)) {
        throw new apiError(404, "video is either deleted or doesn't exist");
    }

    const existingLike = await Like.findOne({
        video: videoId,
        owner: req.user,
    });

    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    null,
                    'Video removed Successfully from like'
                )
            );
    }

    const newLike = await Like.create({
        video: videoId,
        owner: req.user?._id,
    });
    return res
        .status(200)
        .json(new apiResponse(200, newLike, 'video liked Successfully'));
});

const likeComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new apiError(404, "comment is either deleted or doesn't exist");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        owner: req.user,
    }); //4234324
    if (existingLike) {
        await existingLike.deleteOne();
        return res
            .status(200)
            .json(
                new apiResponse(
                    200,
                    null,
                    'comment removed Successfully from like'
                )
            );
    }

    const like = await Like.create({
        comment: commentId,
        owner: req.user?._id,
    });
    return res
        .status(200)
        .json(new apiResponse(200, like, 'comment is liked Successfully'));
});

const getAllLikedVideos = asyncHandler(async (_, res) => {
    const allLikedVideos = await Like.find({
        video: { $exists: true },
    }).populate('video', 'title');

    res.status(200).json(
        new apiResponse(
            200,
            { allLikedVideos, totalLikedVideos: allLikedVideos.length },
            'All Liked video fetched Successfully'
        )
    );
});

const getAllLikedVideosOfIndividualUser = asyncHandler(async (req, res) => {
    const allLikedVideosOfIndividualUser = await Like.find({
        owner: req.user?._id,
        video: { $exists: true },
    }).populate('owner', 'userName');

    res.status(200).json(
        new apiResponse(
            200,
            {
                allLikedVideosOfIndividualUser,
                totalVideoLikedByAnUser: allLikedVideosOfIndividualUser.length,
            },
            'All Liked videos by an individual user'
        )
    );
});

export {
    likeVideo,
    likeComment,
    getAllLikedVideos,
    getAllLikedVideosOfIndividualUser,
};
