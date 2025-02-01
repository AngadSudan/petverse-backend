import { Router } from 'express';
import { loginUser } from '../controllers/user.controllers';

const userRouter = Router();

userRouter.post('/login', loginUser);
userRouter.post('/register', registerUser);
userRouter.post('/wishlist', wishlist);
userRouter.post('/cart', userCart);
userRouter.get('/cart', getCartByUser);
// userRouter.

export default userRouter;
