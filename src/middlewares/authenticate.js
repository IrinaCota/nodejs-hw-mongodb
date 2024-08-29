import createHttpError from 'http-errors';
import { SessionCollection } from '../db/models/session.js';
import { User } from '../db/models/user.js';

export const authenticate = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(createHttpError(401, 'Provide Authorization header'));
  }

  const [ bearer, token ] = authorization.split(' ');

  if (bearer !== 'Bearer' || !token) {
    return next(createHttpError(401, 'Auth header should be of type Bearer'));
  }

  const session = await SessionCollection.findOne({ accessToken: token });

  if (!session) {
    return next(createHttpError(401, 'Session not found'));
  }

  if (new Date() > new Date(session.accessTokenValidUntil)) {
    return next(createHttpError(401, 'Access token is expired'));
  }

  const user = await User.findById(session.userId);

  if (!user) {
    return next(createHttpError(401));
  }

  req.user = user;

  next();
};