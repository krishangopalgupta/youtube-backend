import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import { apiError } from './apiError.js';
import { apiResponse } from './apiResponse.js';
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

const deletePreviousImageFromCloudinary = async (public_id) => {
    try {
        // console.log(public_id);
        // i have destructured it below is the different method
        const { result } = await cloudinary.uploader.destroy(public_id);
        // console.log('result', result);
        if (result !== 'ok') {
            throw new apiError(500, 'File Not deleted');
        }
        return result;
    } catch (error) {
        throw new apiError(500, 'File Not deleted');
    }
};

// const deletePreviousImageFromCloudinary = async (public_id) => {
//     try {
//         console.log("Deleting from Cloudinary:", public_id);

//         const response = await cloudinary.uploader.destroy(public_id);

//         console.log("Cloudinary response:", response);

//         if (response.result !== "ok") {
//             throw new apiError(500, `File not deleted (reason: ${result.result})`);
//         }

//         return response;
//     } catch (error) {
//         console.error("Cloudinary delete error:", error);
//         throw new apiError(500, "File Not deleted");
//     }
// };

// Configuration of Cloudinary
cloudinary.config({
    cloud_name: envVariable.CLOUD_NAME,
    api_key: envVariable.API_KEY,
    api_secret: envVariable.API_SECRET,
});

export { uploadOnCloudinary, deletePreviousImageFromCloudinary };
