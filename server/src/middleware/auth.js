import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import { AppError } from "../utils/AppError.js";

export const auth =async(req,res,next)=>{
    try{
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("No token provided");
      return next(new AppError("Unauthorized: No token provided", 401));
    }
    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    next();
}catch(error){
   logger.warn("Invalid or expired token");
   return next(new AppError("Unauthorized: Invalid token", 401));
}
}