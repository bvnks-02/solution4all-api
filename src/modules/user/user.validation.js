import Joi from "joi";

const updateUserValidation = Joi.object({
  name: Joi.string().trim(),
  email: Joi.string().email().trim(),
  id: Joi.string().hex().length(24).required(),
});

const changePasswordValidation = Joi.object({
  password: Joi.string().min(6).required(),
  id: Joi.string().hex().length(24).required(),
});

const deleteUserValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export { updateUserValidation, changePasswordValidation, deleteUserValidation };
