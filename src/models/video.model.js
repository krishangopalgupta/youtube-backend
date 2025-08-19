import mongoose from 'mongoose';
import mongooseAggregatePaginate from 'mongoose-aggregate-paginate-v2';

const videoSchema = new mongoose.Schema(
    {
        owner: {
            Type: mongoose.Schema.Types.ObjectId,
            ref: User,
        },
        videoFiles: {
            type: String,
            required: true,
        },
        thumbnail: {
            type: String,
            required: true,
        },
        duration: {
            type: Number,
            required: true,
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        description: {
            type: String,
            required: true,
            maxLength: 100,
        },
        views: {
            type: Number,
            default: 0,
        },
        isPublished: {
            type: Boolean,
            default: true,
        }
    },
    {
        timestamps: true,
    }
);

videoSchema.plugin(mongooseAggregatePaginate)

export const Video = mongoose.model("Video", videoSchema);