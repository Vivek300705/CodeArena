import express from "express";
import { registerUser } from "../controllers/registerUser.js";
import { loginUser } from "../controllers/loginUser.js";
import { refreshAccessToken } from "../controllers/refreshToken.js";
import { logoutUser } from "../controllers/logoutUser.js";
import auth from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "../validators/auth.validators.js";

import { forgotPassword } from "../controllers/forgotPassword.js";
import { resetPassword } from "../controllers/resetPassword.js";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);

router.post("/login", validate(loginSchema), loginUser);

router.post("/forgotpassword", forgotPassword);

router.put("/resetpassword/:token", resetPassword);

router.post("/refresh", validate(refreshTokenSchema), refreshAccessToken);

router.post("/logout", validate(refreshTokenSchema), logoutUser);

router.get("/profile", auth, (req, res) => {
  res.json({
    message: "Protected route",
    user: req.user,
  });
});

export default router;
