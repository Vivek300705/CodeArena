import { admin, isFirebaseAdminInitialized } from "../config/firebase.js";
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import RefreshToken from "../models/RefreshToken.js";

export const socialLogin = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ success: false, message: "ID token is required" });
    }

    if (!isFirebaseAdminInitialized) {
      // For development without credentials, we might reject or allow a mock if we want
      return res.status(500).json({ 
        success: false, 
        message: "Firebase Admin is not configured on the server. Social login is disabled." 
      });
    }

    // Verify token with Firebase Admin
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    
    if (!decodedToken) {
      return res.status(401).json({ success: false, message: "Invalid Firebase token" });
    }

    const { uid, email, name, picture } = decodedToken;

    // Check if user exists
    let user = await User.findOne({ 
      $or: [
        { firebaseUid: uid },
        { email: email }
      ]
    });

    if (!user) {
      // Create new user
      // Generate a base username from name or email
      let baseUsername = (name || email.split('@')[0]).replace(/[^a-zA-Z0-9]/g, '').substring(0, 20);
      if (baseUsername.length < 3) baseUsername += Math.floor(1000 + Math.random() * 9000);
      
      // Ensure unique username
      let finalUsername = baseUsername;
      let count = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}${count}`;
        count++;
      }

      user = await User.create({
        username: finalUsername,
        email: email,
        firebaseUid: uid,
        avatarUrl: picture,
        role: "contestant" // Default role
      });
    } else if (!user.firebaseUid) {
      // Link existing account to Firebase
      user.firebaseUid = uid;
      if (!user.avatarUrl) user.avatarUrl = picture;
      await user.save();
    }

    // Generate our JWT tokens
    const accessToken = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const refreshToken = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await RefreshToken.create({
      userId: user._id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    // Send response
    res.status(200).json({
      success: true,
      message: "Social login successful",
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        elo: user.elo,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    console.error("Social login error:", error);
    res.status(401).json({ 
      success: false, 
      message: "Authentication failed. " + (error.message || "")
    });
  }
};
