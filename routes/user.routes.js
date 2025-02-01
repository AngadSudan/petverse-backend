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
const userRouter = Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/registerDoctor', verifyJWT, registerDoctor);
userRouter.post('/updateDoctorDetails', verifyJWT, updateDoctorDetails);
userRouter.post('/listAnimals', verifyJWT, listAnimals);
userRouter.get('/getWishlist', verifyJWT, getWishlist);
userRouter.patch('/addToWishlist', verifyJWT, addToWishlist);
userRouter.patch('/removeWishlist', verifyJWT, removeWishlist);
userRouter.get('/getUserCart', verifyJWT, getUserCart);
userRouter.get('/showlistedAnimals', verifyJWT, showlistedAnimals);
userRouter.patch('/removelistedAnimals', verifyJWT, removelistedAnimals);
userRouter.patch('/addToUserCart', verifyJWT, addToUserCart);
userRouter.patch('/removeFromUserCart', verifyJWT, removeFromUserCart);
userRouter.patch('/changeimage', verifyJWT, changeimage);
userRouter.get('/userLogout', verifyJWT, userLogout);
userRouter.get('/getPreviousOrders', verifyJWT, getPreviousOrders);

export default userRouter;
