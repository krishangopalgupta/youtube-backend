import mongoose, {Schema} from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const userSchema = new Schema(
    {
        watchHistory: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Video',
            },
        ],
        userName: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
            index: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            lowercase: true,
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required'],
        },
        avatarImage: {
            type: String,
            required: true,
        },
        coverImage: {
            type: String,
        },
        // accessToken: {
        //     type: String,
        // },
        refreshToken: {
            type: String,
        },
    },
    {
        timestamps: true,
    }
);

// userSchema.pre('save', async function (next) {
//     if (!this.isModified(this.password)) return next();
//     this.password = await bcrypt.hash(this.password, 10);
//     next();
// });

userSchema.pre('save', async function (next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
    // console.log('Plain input:', password);
    // console.log('Hashed from DB:', this.password);
    const result = await bcrypt.compare(password, this.password);
    // console.log('Compare result:', result);
    return result;
};

userSchema.methods.generateAccessToken = function (next) {
    return jwt.sign(
        {
            _id: this._id,
            userName: this.userName,
            fullName: this.fullName,
            email: this.email,
        },
        process.env.ACCESS_TOKEN_SECRET_KEY,
        {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
    );
};


// We can also hash the refresh for more security pupose in the below second method
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.REFRESH_TOKEN_SECRET_KEY,
        {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
    );
};



// right it doesn't work
// userSchema.methods.generateRefreshToken = async function () {
//   const rawRefreshToken = jwt.sign(
//     { _id: this._id },
//     process.env.REFRESH_TOKEN_SECRET_KEY,
//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
//   );

//   // Hash refresh token with bcrypt before storing in DB
//   const salt = await bcrypt.genSalt(10);
//   const hashedToken = await bcrypt.hash(rawRefreshToken, salt);

//   this.refreshToken = hashedToken; // store hashed
//   return rawRefreshToken; // send raw token to client
// };


export const User = mongoose.model('User', userSchema);
