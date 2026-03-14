import mongoose from "mongoose";
import logger from "./logger.js";

const RETRY_DELAY = 5000; // 5 seconds

const connectDb = async () => {
  try {
    logger.info("Attempting MongoDB connection...");

    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "codearena",
    });

    logger.info(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error({ err: error }, "MongoDB connection failed");

    logger.warn(
      `Retrying MongoDB connection in ${RETRY_DELAY / 1000} seconds...`,
    );

    setTimeout(connectDb, RETRY_DELAY);
  }
};

export default connectDb;
