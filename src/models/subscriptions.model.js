import mongoose, {Schema} from 'mongoose';

const subscriptionSchema = new Schema({
    subscriber:{
        type: Schema.Types.ObjectId, // One  Who is Subscribing
        ref: 'User'
        // 100, 101
    },
    channel:{
        type: Schema.Types.ObjectId, // One To Whom is 'Subscriber' is subscribe
        ref: 'User'
        // 100, 101
    }
}, {timestamps: true})

export const Subscription = mongoose.model("Subscription", subscriptionSchema);