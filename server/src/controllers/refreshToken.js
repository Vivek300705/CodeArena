import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";
import { AppError } from "../utils/AppError.js";

export const refreshAccessToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 401));
    }

    const storedToken = await RefreshToken.findOne({ token: refreshToken });

    if (!storedToken || storedToken.revoked) {
      return next(new AppError("Invalid refresh token", 403));
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const newAccessToken = jwt.sign(
      {
        userId: decoded.userId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );

    res.json({
      accessToken: newAccessToken,
    });
  } catch (error) {
    next(error);
  }
};
