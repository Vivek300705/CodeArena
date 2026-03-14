import User from "../models/User.model.js";
import logger from "../config/logger.js";
import { hashPassword } from "../utils/password.utils.js";
import { AppError } from "../utils/AppError.js";

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, role, password } = req.body;

    logger.info("request recieved");
    logger.info(req.body);

    if (!username || !email || !password) {
      logger.warn("please provide all the required fields");
      return next(
        new AppError("Username, email and password are required", 400),
      );
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      logger.warn("user already exists");
      return next(new AppError("user already exists", 409));
    }

    const passwordHash = await hashPassword(password);

    const user = await User.create({
      username,
      email,
      passwordHash,
      role,
    });

    logger.info({ userId: user._id, email }, "User registered successfully");

    res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(error, "Register error");
    next(error);
  }
};
