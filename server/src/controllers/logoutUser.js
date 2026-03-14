import RefreshToken from "../models/RefreshToken.js";
import { AppError } from "../utils/AppError.js";

export const logoutUser = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return next(new AppError("Refresh token required", 400));
    }

    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });

    if (!tokenDoc) {
      return next(new AppError("Token not found", 404));
    }

    tokenDoc.revoked = true;
    await tokenDoc.save();

    res.json({
      message: "Logged out successfully",
    });
  } catch (error) {
    next(error);
  }
};
