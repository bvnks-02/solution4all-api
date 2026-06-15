import Joi from "joi";

const addProductValidation = Joi.object({
  name_fr: Joi.string().required().trim().min(2),
  description_fr: Joi.string().trim().allow(""),
  price_dzd: Joi.number().min(0).required(),
  category: Joi.string()
    .valid(
      "ordinateurs",
      "imprimantes",
      "onduleurs",
      "serveurs",
      "consommables",
      "logiciels",
      "licences"
    )
    .required(),
  stock: Joi.number().min(0).default(0),
  sku: Joi.string().trim().allow(""),
  brand: Joi.string().trim().allow(""),
  active: Joi.boolean().default(true),
  featured: Joi.boolean().default(false),
  slug: Joi.string().trim(),
});

const updateProductValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
  name_fr: Joi.string().trim().min(2),
  description_fr: Joi.string().trim().allow(""),
  price_dzd: Joi.number().min(0),
  category: Joi.string().valid(
    "ordinateurs",
    "imprimantes",
    "onduleurs",
    "serveurs",
    "consommables",
    "logiciels",
    "licences"
  ),
  stock: Joi.number().min(0),
  sku: Joi.string().trim().allow(""),
  brand: Joi.string().trim().allow(""),
  active: Joi.boolean(),
  featured: Joi.boolean(),
  slug: Joi.string().trim(),
});

const getSpecificProductValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

const deleteProductValidation = Joi.object({
  id: Joi.string().hex().length(24).required(),
});

export {
  addProductValidation,
  getSpecificProductValidation,
  updateProductValidation,
  deleteProductValidation,
};
