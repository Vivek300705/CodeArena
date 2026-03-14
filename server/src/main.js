import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { errorHandler } from "./middleware/errorHandler.js";
import logger from "./config/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import connectDB from "./config/db_config.js";
import authRoutes from "./routes/auth.routes.js";
dotenv.config();

const app=express();
app.use(express.json())
app.use(cors());
app.use(requestLogger);
const port=process.env.PORT||8000;
app.get("/",(req,res)=>{
    res.json({message:"server is running"})
});
app.use("/auth", authRoutes);
// error middleware
app.use(errorHandler);
connectDB();
app.listen(port, ()=>{
    logger.info(`server is running on ${port}`)
});
