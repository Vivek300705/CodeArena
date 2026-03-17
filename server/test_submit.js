import { Queue } from "bullmq";
import dotenv from "dotenv";
import connectDB from "./src/config/db_config.js";
import Submission from "./src/models/submission.model.js";
import Problem from "./src/models/Problem.model.js";

dotenv.config();

async function testSubmit() {
  await connectDB();
  
  const problem = await Problem.findOne();
  if (!problem) {
    console.log("No problems in DB!");
    process.exit(1);
  }

  const sub = await Submission.create({
    userId: "60b8d295f136b819343362a4", // mock user
    problemId: problem._id,
    language: "cpp",
    code: '#include <iostream>\nusing namespace std;\nint main() { int a,b; while(cin>>a>>b) cout<<a+b<<endl; return 0; }',
    status: "queued"
  });

  const queue = new Queue("submissionQueue", {
    connection: { host: "127.0.0.1", port: 6379 }
  });

  await queue.add("judgeSubmission", {
    submissionId: sub._id.toString(),
    problemId: problem._id.toString(),
    language: sub.language
  });

  console.log(`Pushed job for submission ${sub._id}. Check worker logs!`);
  setTimeout(() => process.exit(0), 1000);
}

testSubmit();
