import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },

    passwordHash: {
      type: String,
      required: [true, "Password hash is required"],
      minlength: [8, "Password must be at least 8 characters"],
    },

    role: {
      type: String,
      enum: ["contestant", "admin"],
      default: "contestant",
    },
    elo: {
      type: Number,
      default: 1200,
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true },
);

const User = mongoose.model("User", UserSchema);

export default User;
