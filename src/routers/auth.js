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

// src/routers/auth.js

import { requestResetEmailSchema } from '../validation/auth.js';
import { requestResetEmailController } from '../controllers/auth.js';

// src/routers/auth.js

import { resetPasswordSchema } from '../validation/auth.js';
import { resetPasswordController } from '../controllers/auth.js';

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

/* Інший код файлу */

authRouter.post(
  '/request-reset-email',
  validateBody(requestResetEmailSchema),
  ctrlWrapper(requestResetEmailController),
);

/* Інший код файлу */

authRouter.post(
  '/reset-password',
  validateBody(resetPasswordSchema),
  ctrlWrapper(resetPasswordController),
);