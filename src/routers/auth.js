import express from 'express';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { validateBody } from '../middlewares/validateBody.js';
import { userRegistrationSchema, userLoginSchema } from '../validation/auth.js';
import {
    registerUserController,
    loginUserController,
    refreshSessionController,
    logoutUserController,
} from '../controllers/auth.js';

const authRouter = express.Router();

authRouter.post(
  '/register',
  express.json(),
  validateBody(userRegistrationSchema),
  ctrlWrapper(registerUserController),
);

authRouter.post(
  '/login', validateBody(userLoginSchema), ctrlWrapper(loginUserController),
);

authRouter.post('/refresh', ctrlWrapper(refreshSessionController));

authRouter.post('/logout', ctrlWrapper(logoutUserController));

export default authRouter;