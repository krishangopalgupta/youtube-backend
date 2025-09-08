// import mongoose, { Schema } from 'mongoose';

// const commentSchema = new Schema({
//     content: {
//         type: String,
//     },
//     owner: {
//         type: Schema.Types.ObjectId,
//         ref: 'User',
//     }
// }, {timestamps: true})

// export const Comment = mongoose.model('Comment', commentSchema);

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
        content: {
            type: String,
        },
    },
    { timestamps: true }
);

export const Comment = mongoose.model('Comment', commentSchema);
