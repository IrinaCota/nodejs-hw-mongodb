import createHttpError from 'http-errors';
import { User} from '../db/models/user.js';
import bcrypt from 'bcrypt';
import {
  FIFTEEN_MINUTES,
  THIRTY_DAYS,
  SMTP,
  TEMPLATES_DIR
} from '../constants/index.js';
import { SessionCollection } from '../db/models/session.js';
import { randomBytes } from 'crypto';

import jwt from 'jsonwebtoken';

import env from '../utils/env.js';
import { sendEmail } from '../utils/sendMail.js';

import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';


export const registerUser = async (payload) => {
  const newUser = await User.findOne({
    email: payload.email,
  });

  if (newUser) {
    throw createHttpError(409, 'Email in use');
  }

  const hashedPassword = await bcrypt.hash(payload.password, 10);

  return await User.create({ ...payload, password: hashedPassword });
};

const createNewSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const loginUser = async (payload) => {
  const user = await User.findOne({
    email: payload.email,
  });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const passwordIsEqual = await bcrypt.compare(payload.password, user.password);
  if (!passwordIsEqual) {
    throw createHttpError(401, 'Unauthorized');
  }

  await SessionCollection.deleteOne({ userId: user._id });

  const newSession = createNewSession();

  return await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionCollection.findOne({
    _id: sessionId,
    refreshToken,
  });

  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  if (new Date() > session.refreshTokenValidUntil) {
    throw createHttpError(401, 'Refresh token expired');
  }

  const user = await User.findById(session.userId);

  if (!user) {
    throw createHttpError(401, 'Session for such user not found');
  }

  await SessionCollection.deleteOne({ _id: sessionId });

  const newSession = createNewSession();

  return await SessionCollection.create({
    userId: user._id,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionCollection.deleteOne({ _id: sessionId });
};


export const requestResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email: user.email,
    },
    env(SMTP.JWT_SECRET),
    {
      expiresIn: '15m',
    },
  );

  const resetPasswordTemplatePath = path.join(
    TEMPLATES_DIR,
    'reset-password-email.html',
  );

  const templateSource = (
    await fs.readFile(resetPasswordTemplatePath)
  ).toString();

  const template = handlebars.compile(templateSource);
  const html = template({
    name: user.name,
    link: `${env(SMTP.APP_DOMAIN)}/reset-password?token=${resetToken}`,
  });

  try {
    await sendEmail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Reset your password',
      html,
    });
  } catch {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later',
    );
  }
};


export const resetPassword = async (password, token) => {
  let tokenData;

  try {
    tokenData = jwt.verify(token, env(SMTP.JWT_SECRET));
  } catch (err) {
    if (err instanceof Error) throw createHttpError(401, err.message);
    throw err;
  }

  const user = await User.findOne({
    email: tokenData.email,
    _id: tokenData.sub,
  });

  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const encryptedPassword = await bcrypt.hash(password, 10);

  await User.updateOne(
    { _id: user._id },
    { password: encryptedPassword },
  );

  await SessionCollection.deleteOne({ userId: user._id });
};