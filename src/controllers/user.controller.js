import {asyncHandler} from '../utils/asyncHandler.js';
import {apiError} from '../utils/apiError.js';
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from '../utils/cloudinary.js';
import { apiResponse } from '../utils/apiResponse.js';

const userRegister = asyncHandler(async (req, res, next) => {
    // get user details
    // validation - not empty
    // check if user already exist? username or email
    // check for images, check for avatar
    // upload on cloudinary
    // create user object - create entry in db
    // remove password and refresh token from response
    // check for response creation
    // return response

    const {userName, fullName, email, password} = req.body;
    console.log(userName);

    // validation fields
    if (
        [userName, fullName, email, password].some(
            (fields) => fields.trim() === ''
        )
    ) {
        throw new apiError(400, 'All fields are Mandatory');
    }

    // User Exist or not?
    const existedUser = User.findOne({
        $or: [{userName}, {email}],
    });
    if (existedUser) throw new apiError(409, 'User is already Existed');

    console.log(`req.files, ${req.files}`);
    console.log(`req.files?.avatar, ${req.files?.avatar}`);
    console.log(`req.files?.avatar[0], ${req.files?.avatar[0]}`);

    const avatarLocalPath = req.files?.avatar[0].path;
    const coverImageLocalPath = req.files?.coverImage[0].path;

    if (!avatarLocalPath) throw new apiError(400, 'Avatar file is required');

    const avatar = await uploadOnCloudinary(avatarLocalPath);
    const coverImage = await uploadOnCloudinary(coverImageLocalPath);

    console.log(avatar);
    if (!avatar) throw new apiError(400, 'Avatar file is required');

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || '',
        userName: userName.toLowerCase(),
        email,
        password,
    });
    const createdUser = await user
        .findById(user._id)
        .select('-password -refreshToken');
    if (!createdUser)
        throw new apiError(500, 'Something went wrong while creating User');

    return res.send(201).json(
        new apiResponse(200, createdUser, "User Registered Successfully")
    )
});

export {userRegister};
