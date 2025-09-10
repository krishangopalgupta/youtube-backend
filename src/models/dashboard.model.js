import mongoose, { Schema } from 'mongoose';

const dashboardSchema = new Schema({
    video: {
        type: Schema.Types.ObjectId,
        ref: 'Video',
    },
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User',
    },
    subscription: {
        type: Schema.Types.ObjectId,
        ref: 'Subscription',
    },
    like: {
        type: Schema.Types.ObjectId,
        ref: 'Like',
    },
    comment: {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
    },
});

export const Dashboard = new mongoose.model('Dashboard', dashboardSchema);
