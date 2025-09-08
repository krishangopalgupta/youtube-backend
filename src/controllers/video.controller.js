import mongoose, { isValidObjectId } from 'mongoose';
import { Video } from '../models/video.model.js';
import { apiError } from '../utils/apiError.js';
import { apiResponse } from '../utils/apiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import {
    deletePreviousImageFromCloudinary,
    uploadOnCloudinary,
} from '../utils/cloudinary.js';

const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;
    //TODO: get all videos based on query, sort, pagination
    const allVideos = await Video.find();
    res.status(200).json(
        new apiResponse(
            201,
            { allVideos, totalVideoCount: allVideos.length },
            'All Video fetched Successfully'
        )
    );
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body;
    console.log('req.files------>', req.files);
    // TODO: get video, upload to cloudinary, create video
    const videoFilePath = req.files?.videoFile[0].path;
    if (!videoFilePath) {
        throw new apiError(404, 'Unable to find path of the video');
    }

    const videoUploadingResponse = await uploadOnCloudinary(videoFilePath);
    if (!videoUploadingResponse) {
        throw new apiError(404, 'Error While Uploading Video');
    }

    // Thumbnail Upload
    const thumbnailFilePath = req.files?.thumbnail[0].path;
    if (!thumbnailFilePath) {
        throw new apiError(404, 'Unable to find thumbnail Path');
    }
    const thumbnailUploadResponse = await uploadOnCloudinary(thumbnailFilePath);
    if (!thumbnailUploadResponse) {
        throw new apiError(404, 'Error While Uploading thumbnail');
    }

    // console.log('thumbnailUploadResponse', thumbnailUploadResponse);
    // console.log('videoUploadingResponse', videoUploadingResponse);
    const video = await Video.create({
        title: title,
        description: description,
        duration: videoUploadingResponse.duration,
        thumbnail: thumbnailUploadResponse.secure_url,
        videoFile: videoUploadingResponse.secure_url,
        views: 0,
        owner: req.user._id,
    });
    res.status(200).json(
        new apiResponse(201, video, 'Video Uploaded Successfully')
    );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const video = await Video.findById({ _id: videoId });
    res.status(200).json(new apiResponse(200, video, 'Video fetch by his id'));
});

// We can also update in this way
//     const updateInfo = {};
//     if (title) {
//         updateInfo.title = title;
//     }
//     if (description) {
//         updateInfo.description = description;
//     }
//     const updateVideo = await Video.findByIdAndUpdate(
//         videoId,
//         {
//             $set: updateInfo,
//         },
//         { new: true }
//     );

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;

    if (!isValidObjectId(videoId)) {
        throw new apiError(403, 'VideoId is not found');
    }

    const video = await Video.findById({ _id: videoId });

    // Logged In user and user who upload the video can modify the video
    console.log(req.user?._id.toString(), video.owner?.toString());
    if (req.user?._id.toString() !== video.owner?.toString()) {
        throw new apiError(
            403,
            "You don't have authorization to update this video"
        );
    }
    if (!video) {
        throw new apiError(404, 'Video is not found');
    }
    if (title) {
        video.title = title;
    }
    if (description) {
        video.description = description;
    }

    if (req.file?.path) {
        const publicId = video.thumbnail.split('/').pop().split('.')[0];
        // console.log(publicId);
        const response = await uploadOnCloudinary(req.file?.path);
        video.thumbnail = response.secure_url;
        await deletePreviousImageFromCloudinary(publicId);
    }
    await video.save({ validateBeforeSave: false });
    res.status(200).json(
        new apiResponse(200, null, 'Video Updated Successfully')
    );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) {
        throw new apiError(404, 'Video is not found');
    }

    const video = await Video.findById({ _id: videoId });
    if (!video) {
        throw new apiError(403, "video is either deleted or doesn't exist ");
    }
    console.log('Video owner:', video.owner?.toString());
    console.log('Logged-in user:', req.user?._id.toString());

    if (video.owner?.toString() !== req.user?._id.toString()) {
        throw new apiError(409, 'You are not authorized to delete this video');
    }
    // const deletedVideo = await Video.findByIdAndDelete({ _id: videoId });
    // if (!deletedVideo) {
    //     throw new apiError(404, 'Video is either deleted or doesn"t exist');
    // }

    await video.deleteOne();
    res.status(200).json(
        new apiResponse(200, null, 'Video Deleted Successfully')
    );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    const video = await Video.findById(videoId);
    if (!video) {
        throw new apiError(404, 'Video not found');
    }

    if (req.user?._id.toString() !== video.owner?.toString()) {
        throw new apiError(409, 'You are not authorized to delete this video');
    }

    video.isPublished = !video.isPublished;
    await video.save({ validateBeforeSave: false });

    return res
        .status(200)
        .json(
            new apiResponse(
                200,
                video,
                `Video has been ${video.isPublished ? 'published' : 'unpublished'} successfully`
            )
        );
});

const updateViews = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const videoDoc = await Video.findByIdAndUpdate(
        _id,
        {
            $inc: {
                views: 1,
            },
        },
        { new: true }
    );
    //  this is also a method to update views of a video
    // videoDoc.views = videoDoc.views+1;
    // await videoDoc.save({validateBeforeSave: false})
    res.status(200).json(new apiResponse(200, videoDoc, 'fetched'));
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateViews,
};
