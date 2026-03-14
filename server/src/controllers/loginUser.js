import User from "../models/User.model.js";
import { comparePassword } from "../utils/password.utils.js";
import { AppError } from "../utils/AppError.js";
import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import RefreshToken from "../models/RefreshToken.js";

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError("Email and password are required", 400));
    }

    logger.info({ email }, "Login attempt");

    const user = await User.findOne({ email });

    if (!user) {
      logger.warn({ email }, "Login failed: user not found");
      return next(new AppError("Invalid credentials", 401));
    }

    const isMatch = await comparePassword(password, user.passwordHash);

    if (!isMatch) {
      logger.warn({ email }, "Login failed: incorrect password");
      return next(new AppError("Invalid credentials", 401));
    }

    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    logger.info({ userId: user._id }, "User logged in successfully");

    res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(error, "Login error");
    next(error);
  }
};
