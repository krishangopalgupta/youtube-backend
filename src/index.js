import mongoose from 'mongoose';
import {DB_NAME} from './constansts';
import express from 'express';
const app = express();

(async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
        // app.on

        app.listen(process.env.PORT, () => {
            console.log(`Server is running at port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error('Error', error);
        throw error;
    }
})();
