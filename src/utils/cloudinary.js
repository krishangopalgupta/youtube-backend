import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
import { apiError } from './apiError';
import { apiResponse } from './apiResponse';
const envVariable = process.env;

// Creating a function for taking file from user and wrap it in a try catch block using asyncHandler.js
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        // upload the file on Cloudinary
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        });
        // file has been successfully uploaded

        // console.log('file is uploaded on cloudinary', response.url);
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the operation got failed
        return null;
    }
};


const deletePreviousImageFromCloudinary = async(localFilePath) =>{
    try {
        const result = cloudinary.uploader.destroy(localFilePath);
        if(result !== "ok"){
            throw new apiError(500, "File Not deleted");
        }
        res.status(200).json(new apiResponse(201, "", "Deleted successfully"))
    } catch (error) {
        throw new apiError(500, "File Not deleted");
    }
}
// Configuration of Cloudinary
cloudinary.config({
    cloud_name: envVariable.CLOUD_NAME,
    api_key: envVariable.API_KEY,
    api_secret: envVariable.API_SECRET,
});

export {uploadOnCloudinary, deletePreviousImageFromCloudinary};
