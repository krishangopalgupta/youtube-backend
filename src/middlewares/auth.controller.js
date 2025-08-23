import { User } from '../models/user.model.js';
import { apiError } from '../utils/apiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import jwt from 'jsonwebtoken';

export const JWTVerify = asyncHandler(async (req, _, next) => {
    try {
        // console.log('this is req', req);  
        // console.log('this is req cookies', req.cookies);
        const token =
            req.cookies?.accessToken ||
            req.header('Authorization').replace('Bearer ', '');

        if (!token) {
            throw new apiError(401, 'Invalid Access Token');
        }

        const decodedToken = jwt.verify(
            token,
            process.env.ACCESS_TOKEN_SECRET_KEY
        );

        // console.log('decoded token', decodedToken);
        const user = await User.findById(decodedToken?._id).select(
            '-password -refreshToken'
        );
        if (!user) {
            throw new apiError(401, 'Invalid Access token');
        }
        req.user = user;
        console.log(req.user);
        next();
    } catch (error) {
        throw new apiError(401, 'Invalid Access Token');
    }
});
