import dotenv from 'dotenv'
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

dotenv.config({
    path: './.env'
})
app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true
    })
);

app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieParser());


// Router Import
// Export as default thats why imported is different
import userRouter from './routes/user.routes.js';

// Router declaration
app.use('/api/v1/users', userRouter);



export {app};
