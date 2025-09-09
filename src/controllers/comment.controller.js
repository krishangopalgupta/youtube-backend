import { isValidObjectId } from 'mongoose';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { Comment } from '../models/comment.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { videoId } = req.params;
    if (!content) {
        throw new apiError(404, 'Content is required');
    }

    if (!isValidObjectId(videoId)) {
        throw new apiError(404, 'Video not found!');
    }

    const comment = await Comment.create({
        comment: content,
        owner: req.user,
        video: videoId,
    });

    // const videoInfo = await Comment.find({ _id: videoId }).populate(
    //     'video',
    //     'title, description'
    // );
    res.status(201).json(
        new apiResponse(
            201,
            // { comment, video: videoInfo },
            // comment,
            null,
            'Comment added Successfully'
        )
    );
});


const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body;
    const { commentId } = req.params;
    if (!content) {
        throw new apiError(404, 'Content is required');
    }

    if (!isValidObjectId(commentId)) {
        throw new apiError(404, 'Comment is either deleted or doesnt exist!');
    }

    const comment = await Comment.findById(commentId);
    if (req.user?._id.toString() !== comment.owner?.toString()) {
        throw new apiError(
            403,
            "You don't have authorization to update this Comment"
        );
    }

    const updatedComment = await Comment.findByIdAndUpdate(
        commentId,
        {
            $set: {
                comment:content,
            },
        }, {new: true},
    );

    res.status(201).json(
        new apiResponse(
            201,
            updatedComment,
            'Comment added Successfully on a video'
        )
    );
});
const getAllComment = asyncHandler(async (req, res) => {
    const allComment = await Comment.find();
    res.status(200).json(
        new apiResponse(200, allComment, 'All comment fetched Successfully')
    );
});

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    if (!isValidObjectId(commentId)) {
        throw new apiError(404, 'Comment is either deleted or doesnt exist!');
    }

    const comment = await Comment.findById({ _id: commentId });
    if (req.user?._id.toString() !== comment.owner?.toString()) {
        throw new apiError(
            403,
            "You don't have authorization to delete this Comment"
        );
    }

    await comment.deleteOne();
    res.status(201).json(
        new apiResponse(201, null, 'Comment deleted Successfully')
    );
});

export { createComment, updateComment, getAllComment, deleteComment };
