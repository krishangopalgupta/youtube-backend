import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import {apiResponse} from '../utils/apiResponse.js';

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

    const {fullName, userName, email, password} = req.body;

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
        $or: [{userName}, {email}],
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


export {registerUser};
