import Joi from "joi";

export const userRegistrationSchema = Joi.object({
    name: Joi.string().min(4).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(7).required(),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

// src/validation/auth.js

/* Інший код файлу */

export const requestResetEmailSchema = Joi.object({
  email: Joi.string().email().required(),
});


/* Інший код файлу */

export const resetPasswordSchema = Joi.object({
  password: Joi.string().required(),
  token: Joi.string().required(),
});