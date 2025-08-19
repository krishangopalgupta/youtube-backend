import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs';
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

        console.log('file is uploaded on cloudinary', response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the operation got failed
        return null;
    }
};

// Configuration of Cloudinary
cloudinary.config({
    cloud_name: envVariable.CLOUD_NAME,
    api_key: envVariable.API_KEY,
    api_secret: envVariable.API_SECRET,
});

export {uploadOnCloudinary};
