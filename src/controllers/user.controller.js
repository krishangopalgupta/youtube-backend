import { asyncHandler } from '../utils/asyncHandler.js';
import { apiError } from '../utils/apiError.js';
import { User } from '../models/user.model.js';
import {
    deletePreviousImageFromCloudinary,
    uploadOnCloudinary,
} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';
import jwt from 'jsonwebtoken';

// We will use it many times thats why we are using it as a saperate method
const generateAccessAndRefreshToken = async (userId) => {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // User is your Mongoose model (something like const User = mongoose.model("User", userSchema);).
    // The result of .findOne() is a Mongoose Document (an instance of that model).
    // That user object is not just plain JSON — it’s a document object with:
    // All the fields from your schema (email, userName, password, etc.)
    // Plus any methods you defined on the schema.

    // User.findById gives you a document (not a plain object).
    // That document inherits from the userSchema prototype.
    // Since you defined generateAccessToken on the schema’s .methods, it’s available on every document instance.
    // Inside the method, this refers to the document itself (so you can access this._id, this.email, etc.).
    user.refreshToken = refreshToken;

    // console.log(user)
    // console.log("this is user's token", user.accessToken);
    // console.log("this is user's token", user.refreshToken);
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res, next) => {
    // get user details
    // validation - not empty
    // check if user already exist? username or email
    // check for images, check for avatar
    // upload on cloudinary
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for response creation
    // return response

    const { fullName, userName, email, password } = req.body;

    // validation fields
    if (
        [userName, fullName, email, password].some(
            (fields) => fields.trim() === ''
        )
    ) {
        throw new apiError(400, 'All fields are Mandatory');
    }

    //     // User Exist or not?
    const existedUser = await User.findOne({
        $or: [{ userName }, { email }],
    });
    if (existedUser) throw new apiError(409, 'User is already Existed');

    // console.log(existedUser);
    // console.log(`req.files, ${req.files}`);
    // console.log(`req.files?.avatar, ${req.files?.avatarImage}, ${Array.isArray(req.files.avatarImage)}`);
    // console.log(`req.files?.avatar[0], ${req.files?.avatar[0]}`);

    const avatarLocalPath = req.files?.avatarImage[0].path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    let coverImageLocalPath;
    if (
        req.files &&
        Array.isArray(req.files.coverImage) &&
        req.files.coverImage.size > 0
    ) {
        coverImageLocalPath = req.files?.coverImage[0]?.path;
    }
    // console.log('Files =>', req.files);
    // console.log('Body =>', req.body);
    if (!avatarLocalPath) throw new apiError(400, 'Avatar file is required');

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    // console.log(avatar);
    if (!avatar) throw new apiError(400, 'Avatar file is required');

    const user = await User.create({
        fullName,
        avatarImage: avatar.url,
        coverImage: coverImage?.url || '',
        userName: userName.toLowerCase(),
        email,
        password,
    });
    const createdUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );
    if (!createdUser)
        throw new apiError(500, 'Something went wrong while creating User');

    // console.log(createdUser);
    return res
        .status(201)
        .json(
            new apiResponse(200, createdUser, 'User Registered Successfully')
        );
});

const loginUser = asyncHandler(async (req, res) => {
    // req.body -> data
    // userName or email, exist or not?
    // find user
    // password check
    // if exist
    // create refresh token and access token
    // send cookies
    // redirect to page
    // else
    // Throw error message

    const { email, userName, password } = req.body;
    if (!email && !userName) {
        throw new apiError(404, 'Username or email is required');
    }

    const user = await User.findOne({
        $or: [{ email }, { userName }],
    });

    if (!user) {
        throw new apiError(404, 'user is not exist');
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
        throw new apiError(401, 'Invalid user Credential');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
        user._id
    );

    const loggedInUser = await User.findById(user._id).select(
        '-password -refreshToken'
    );

    const options = {
        httpOnly: true,
        secure: true,
    };

    return res
        .status(200)
        .cookie('accessToken', accessToken, options)
        .cookie('refreshToken', refreshToken, options)
        .json(
            new apiResponse(
                200, // this is status code
                // this whole object is an user
                {
                    user: loggedInUser,
                    accessToken,
                    refreshToken,
                },
                'User Logged in successfully'
            )
        );
});

const logoutUser = asyncHandler(async (req, res) => {
    // First method

    // console.log('this is req from auth.controller.js', req);
    await User.findByIdAndUpdate(req.user._id, {
        $set: {
            refreshToken: undefined,
        },
        new: true,
    });

    const options = {
        httpOnly: true,
        secure: true,
    };

    res.status(200)
        .clearCookie('accessToken', options)
        .clearCookie('refreshToken', options)
        .json(new apiResponse(200, {}, 'User loggedOut successfully'));

    // Second Method
    // const user = await User.findById(req.user._id);
    // user.refreshToken = undefined;
    // user.save({saveWithoutValidation: false})
});

const refreshAccessToken = asyncHandler(async (req, res) => {
    // Web browser || Mobile Apps
    const incomingRefreshToken =
        req.cookie?.refreshToken || req.body?.refreshToken;

    if (!incomingRefreshToken) {
        throw new apiError(
            401,
            'Unauthorized Request froom incoming refresh tokens'
        );
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET_KEY
        );

        if (!decodedToken) {
            throw new apiError(401, 'Unauthorized Token');
        }

        const user = await User.findById(decodedToken?._id);
        if (!user) {
            throw new apiError(401, 'Invalid Refresh Token');
        }

        if (user?.refreshToken !== incomingRefreshToken) {
            throw new apiError(401, 'Refresh Token is expired or used');
        }

        const { newRefreshToken, accessToken } =
            await generateAccessAndRefreshToken(user._id);

        const options = {
            httpOnly: true,
            secure: true,
        };

        res.status(201)
            .cookie('refreshToken', newRefreshToken, options)
            .cookie('accessToken', accessToken, options)
            .json(
                new apiResponse(
                    200,
                    { refreshToken: newRefreshToken, accessToken },
                    'Refreshed Token'
                )
            );
    } catch (error) {
        throw new apiError(401, error?.message, 'Invalid Refresh Token');
    }
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    console.log(req.body);
    // Req is an object which contain multiple object such as header, cookies, body, etc.
    // So, In our jwtverify we also inject a user in req to access it in our auth.controller.js
    console.log(req.user);
    const user = await User.findById(req.user?._id);
    if (!user) {
        throw new apiError(401, 'No User Available');
    }

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword);
    if (!isPasswordCorrect) {
        throw new apiError(401, 'Invalid Old Password');
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        201,
        new apiResponse({ password: newPassword }),
        'Password Updated Successfully'
    );
});

const getCurrentUser = asyncHandler(async (req, res) => {
    return res.status(200).json(201, req.user, 'Current Logged In user');
});

const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;

    if (!fullName || !email) {
        throw new apiError(400, 'All fields are required');
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $set: {
            fullName,
            email: email,
        },
        new: true,
    }).select('-password');

    res.status(200).json(201, user, 'User Account Details Successfully ');
});

const updateUserAvatar = asyncHandler(async (req, res) => {
    // In above user registration we wrote FILES no file because in router we are uploading multiple files at a time ie. avatarImage, localImage.
    const avatarLocalPath = req.file?.path;
    if (!avatarLocalPath) {
        throw new apiError(404, 'Avatar File is missing');
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
        throw new apiError(404, 'Error while uploading avatar Image');
    }

    const previousUserAvatar = await User.findById(req.user?._id);
    const holdImageUrlForPrevImageDeletion = previousUserAvatar.avatarImage;

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatarImage: response.url,
            },
        },
        { new: true }
    ).select('-password');

    // Delete From cloudinary
    // my avatar url will be in the form of this where trv... will be my public_id so we need that "http://res.cloudinary.com/dhuvk3fjc/image/upload/v1755880166/trvzeohwu4jk9hgd5td3.jpg"
    const avatarImageUrlArray = holdImageUrlForPrevImageDeletion.split('/');
    const avatarImageUrlWithExt =
        avatarImageUrlArray[avatarImageUrlArray.size - 1]; //wiil got this trvzeohwu4jk9hgd5td3.jpg
    const public_id = avatarImageUrlWithExt.split('.')[0];
    await deletePreviousImageFromCloudinary(public_id);

    const splitUrl = imageUrl.split('/');
    console.log(splitUrl);
    res.status(200).json(
        new apiResponse(201, user, 'AvatarImage updated Successfully')
    );
    // user.save({ validateBeforeSave: false });
});

const updateUserCoverImage = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path;
    if (!coverImageLocalPath) {
        throw new apiError(400, 'CoverImage is missing');
    }

    const coverImage = await uploadOnCloudinary(coverImageLocalPath);
    if (!coverImage) {
        throw new apiError(404, 'Error while uploading coverImage');
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: {
                    coverImage: coverImage.url,
                },
            },
        },
        { new: true }
    ).select('-password');

    res.status(200).json(
        new apiResponse(201, user, 'CoverImage updated Successfully')
    );
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
    console.log(req.params);
    const { userName } = req.params;
    if (!userName?.trim()) {
        throw new apiError(400, 'UserName is missing');
    }

    const channel = await User.find([
        {
            $match: {
                userName: userName?.toLowerCase(),
            },
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel', // this is from database
                as: 'subscribers',
            },
            // returns the number of documents
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber', // this is from database
                as: 'ChannelSubscribedToCount',
            },
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: '$subscribers', // count the no. of documents
                },
                channelSubscriberedToCount: {
                    $size: '$channel',
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                        then: true,
                        else: false,
                    },
                },
            },
        },
        {
            $proj: {
                fullName: 1,
                userName: 1,
                subscribers: 1,
                ChannelSubscribedToCount: 1,
                subscriberCount: 1,
                avatarImage: 1,
                coverImage: 1,
            },
        },
    ]);

    console.log(channel);
    if (!channel?.length) {
        throw new apiError(404, "channel doesn't exist");
    }

    return res
        .status(200)
        .json(
            new apiResponse(201, channel, 'User Channel Fetched Successfully')
        );
});

const getUserWatchHistory = asyncHandler(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                id: new mongoose.Types.ObjectId(req.user?._id),
            },
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchHistory',
                foreignField: '_id',
                as: 'watchHistory',
                project: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                        },
                        pipeline: [
                            {
                                $project: {
                                    fullName: 1,
                                    email: 1,
                                    userName: 1,
                                    avatar: 1,
                                },
                            },
                            {
                                $addFields: {
                                    owner: {
                                        $first: '$owner',
                                    },
                                },
                            },
                        ],
                    },
                ],
            },
        },
    ]);
    return res
        .status(200)
        .json(
            new apiResponse(
                201,
                user[0].watchHistory,
                'watch history fetched successfully'
            )
        );
});
export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccessToken,
    changeCurrentPassword,
    getCurrentUser,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getUserChannelProfile,
    getUserWatchHistory,
};
