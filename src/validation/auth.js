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