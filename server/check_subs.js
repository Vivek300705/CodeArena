import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const submissionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  problemId: mongoose.Schema.Types.ObjectId,
  code: String,
  language: String,
  status: String,
  verdict: String,
  error: String,
  runtime: Number
});

const Submission = mongoose.model('Submission', submissionSchema);

async function checkSubmissions() {
  await mongoose.connect(process.env.MONGODB_URI);
  const subs = await Submission.find({}, 'language status verdict error runtime').sort({ _id: -1 }).limit(3);
  console.log(JSON.stringify(subs, null, 2));
  process.exit(0);
}

checkSubmissions();
