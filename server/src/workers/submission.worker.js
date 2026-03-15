import { Worker } from "bullmq";

const worker = new Worker(
  "submissionQueue",
  async (job) => {
    console.log("Processing submission:", job.data);
  },
  {
    connection: {
      host: "127.0.0.1",
      port: 6379,
    },
  },
);

worker.on("completed", (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on("failed", (job, err) => {
  console.error(`Job ${job?.id} failed`, err);
});
