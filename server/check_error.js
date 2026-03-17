import dotenv from "dotenv";
import connectDB from "./src/config/db_config.js";
import Submission from "./src/models/submission.model.js";

dotenv.config();

async function check() {
  await connectDB();
  const sub = await Submission.findOne().sort({ createdAt: -1 });
  if (!sub) {
    console.log("No submissions!");
  } else {
    console.log("ID:", sub._id.toString());
    console.log("Verdict:", sub.verdict);
    console.log("Error:\n", sub.error);
  }
  process.exit(0);
}

check();
