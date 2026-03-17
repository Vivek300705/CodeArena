import { Queue } from "bullmq";
import dotenv from "dotenv";

dotenv.config();

const queue = new Queue("submissionQueue", {
  connection: { host: "127.0.0.1", port: 6379 }
});

async function test() {
  const jobs = await queue.getWaiting();
  console.log("Waiting jobs:", jobs.length);
  const active = await queue.getActive();
  console.log("Active jobs:", active.length);
  process.exit(0);
}

test();
