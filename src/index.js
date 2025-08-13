import dotenv from 'dotenv';
import connectDB from './db/index.js';




dotenv.config({
    path: './env'
});



connectDB();







// different method

// import mongoose from 'mongoose';
// import {DB_NAME} from './constansts.js';
// import express from 'express';
// const app = express();
// (async () => {
//     try {
//         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//         app.on('errrr', (error) => {
//             console.log('Error in try block after connection ', error);
//             throw error;
//         });

//         app.listen(process.env.PORT, () => {
//             console.log(`Server is running at port ${process.env.PORT}`);
//         });
//     } catch (error) {
//         console.error('Error', error);
//         throw error;
//     }
// })();
