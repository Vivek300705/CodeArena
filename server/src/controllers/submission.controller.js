import Submission from "../models/submission.model.js";
import { submissionQueue } from "../queues/submission.queue.js";

export const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    const submission = await Submission.create({
      userId: req.user.userId,
      problemId,
      code,
      language,
      status: "queued",
    });

    // add job to queue
    await submissionQueue.add("judgeSubmission", {
      submissionId: submission._id,
      problemId: submission.problemId,
      language: submission.language,
    });

    res.status(201).json(submission);
  } catch (error) {
    next(error);
  }
};
export const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      userId: req.user.userId,
    })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    res.json(submissions);
  } catch (error) {
    next(error);
  }
};