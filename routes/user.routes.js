import { Router } from 'express';
import {
    registerUser,
    loginUser,
    updateDoctorDetails,
    listAnimals,
    registerDoctor,
    getWishlist,
    addToWishlist,
    removeWishlist,
    getUserCart,
    showlistedAnimals,
    removelistedAnimals,
    addToUserCart,
    removeFromUserCart,
    changeimage,
    userLogout,
    getPreviousOrders,
} from '../controllers/user.controllers.js';
import verifyJWT from '../middlewares/Auth.middleware.js';
import upload from '../middlewares/multer.middleware.js';
const userRouter = Router();

userRouter.post('/register', upload.single('profile'), registerUser);
userRouter.post('/login', loginUser);
userRouter.post(
    '/registerDoctor',
    upload.fields([{ name: 'license' }, { name: 'profile' }]),
    registerDoctor
);
userRouter.post('/updateDoctorDetails', verifyJWT, updateDoctorDetails);
userRouter.post('/listAnimals', verifyJWT, upload.single('image'), listAnimals);
userRouter.get('/getWishlist', verifyJWT, getWishlist);
userRouter.get('/getUserCart', verifyJWT, getUserCart);
userRouter.get('/showlistedAnimals', verifyJWT, showlistedAnimals);
userRouter.get('/userLogout', verifyJWT, userLogout);
userRouter.get('/getPreviousOrders', verifyJWT, getPreviousOrders);
userRouter.patch('/addToWishlist', verifyJWT, addToWishlist);
userRouter.patch('/removeWishlist', verifyJWT, removeWishlist);
userRouter.patch('/removelistedAnimals', verifyJWT, removelistedAnimals);
userRouter.patch('/addToUserCart', verifyJWT, addToUserCart);
userRouter.patch('/removeFromUserCart', verifyJWT, removeFromUserCart);
userRouter.patch('/changeimage', verifyJWT, changeimage);

export default userRouter;
