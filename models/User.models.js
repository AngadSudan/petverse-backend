import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
    {
        name: { type: String, unique: true, required: true, index: true },
        username: { type: String, unique: true, required: true },
        phoneNumber: {
            type: String,
            unique: true,
            required: true,
            index: true,
        },
        email: { type: String, unique: true, required: true, index: true },
        password: { type: String, required: true },
        profileImageUrl: {
            type: String,
            default:
                'https://img.freepik.com/free-vector/businessman-character-avatar-isolated_24877-60111.jpg?t=st=1734246128~exp=1734249728~hmac=929022529bceefc2aa41c6ff3620b5a3efa37489cab55d29e1a5d8846a937ac3&w=740',
        },
        pincode: { type: String, required: true },
        coordinate: {
            type: { type: String, enum: ['Point'], default: 'Point' },
            coordinates: { type: [Number], required: true, index: '2dsphere' }, // [longitude, latitude]
        },
        role: {
            type: String,
            enum: ['user', 'doctor', 'dealer', 'admin'],
            required: true,
        },
        wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        cart: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
        doctorProfile: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Doctor',
            default: null,
        },
        isActive: { type: Boolean, default: true },
        refreshToken: { type: String },
    },
    { timestamps: true }
);

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});
UserSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password);
};

UserSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            isSubscribed: this.isSubscribed,
            userType: this.userType,
        },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    );
};

UserSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,
        },
        process.env.JWT_SECRET_TOKEN,
        { expiresIn: process.env.JWT_TOKEN_EXPIRY }
    );
};

const User = mongoose.model('User', UserSchema);
export default User;
