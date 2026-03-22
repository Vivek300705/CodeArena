import crypto from "crypto";
import User from "../models/User.model.js";
import bcrypt from "bcrypt";

// @desc    Reset password
// @route   PUT /api/auth/resetpassword/:token
// @access  Public
export const resetPassword = async (req, res, next) => {
  try {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
       return res.status(400).json({ success: false, error: "Invalid or expired token" });
    }

    // Set new password
    if (!req.body.password) {
        return res.status(400).json({ success: false, error: "Please supply a new password" })
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(req.body.password, salt);

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Password reset successful"
    });
  } catch (error) {
    next(error);
  }
};
