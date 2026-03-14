import { AppError } from "../utils/AppError.js";

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      const message = error.errors?.[0]?.message || "Validation error";
      next(new AppError(message, 400));
    }
  };
};