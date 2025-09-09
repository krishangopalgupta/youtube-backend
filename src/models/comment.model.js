import mongoose, { Schema } from 'mongoose';

const commentSchema = new Schema(
    {
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User',
        },
        video: {
            type: Schema.Types.ObjectId,
            ref: 'Video',
        },
        comment: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
