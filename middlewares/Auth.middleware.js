import jwt from 'jsonwebtoken';
import User from '../models/user.models.js';
import ApiError from '../utils/ApiError.js';

const verifyJWT = async (req, res, next) => {
    const token =
        req.cookies.accessToken ||
        req.body.userToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json(new ApiError(401, 'Unauthorized'));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    const user = await User.findById(decodedToken?._id).select(
        '-password -refreshToken'
    );

    if (!user) return res.status(401).json(new ApiError(401, 'Unauthorized'));

    req.user = user;

    next();
};
const verifyAdmin = async (req, res, next) => {
    const token =
        req.cookies.accessToken ||
        req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json(new ApiError(401, 'Unauthorized'));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET_TOKEN);

    const user = await User.findById(decodedToken?._id).select(
        '-password -refreshToken'
    );

    if (user.userType !== 'admin')
        return res
            .status(401)
            .json(
                new ApiError(
                    401,
                    'Cannot access Admin routes due to a nonadmin userId'
                )
            );

    next();
};
export default verifyJWT;
export { verifyAdmin };
