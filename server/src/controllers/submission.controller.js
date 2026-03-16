import Submission from "../models/submission.model.js";
import { submissionQueue } from "../queues/submission.queue.js";
import logger from "../config/logger.js";

/**
 * @desc    Create a new code submission and add to judging queue
 * @route   POST /api/v1/submissions
 * @access  Private
 */
export const createSubmission = async (req, res, next) => {
  try {
    const { problemId, code, language } = req.body;

    // 1. Basic validation to prevent empty jobs
    if (!problemId || !code || !language) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: problemId, code, or language",
      });
    }

    // 2. Create the submission record in MongoDB
    // We set status to 'queued' initially
    const submission = await Submission.create({
      userId: req.user.userId,
      problemId,
      code,
      language,
      status: "queued",
    });

    logger.info(
      { submissionId: submission._id, userId: req.user.userId },
      "Submission record created in database",
    );

    // 3. Add the job to BullMQ
    // We only pass the IDs to keep the Redis payload lightweight
    await submissionQueue.add("judgeSubmission", {
      submissionId: submission._id,
      problemId: submission.problemId,
      language: submission.language,
    });

    logger.info(
      { submissionId: submission._id },
      "Job successfully added to submissionQueue",
    );

    // 4. Respond to client immediately
    // Frontend will use this ID to start polling the status
    res.status(201).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    logger.error(
      { err: error.message, stack: error.stack },
      "Controller Error: createSubmission",
    );
    next(error);
  }
};

/**
 * @desc    Get all submissions for the logged-in user
 * @route   GET /api/v1/submissions
 * @access  Private
 */
export const getSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({
      userId: req.user.userId,
    })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 });

    logger.info(
      { userId: req.user.userId, count: submissions.length },
      "Fetched user submissions",
    );

    res.status(200).json({
      success: true,
      data: submissions,
    });
  } catch (error) {
    logger.error({ err: error.message }, "Controller Error: getSubmissions");
    next(error);
  }
};

/**
 * @desc    Get a single submission status (for polling)
 * @route   GET /api/v1/submissions/:id
 * @access  Private
 */
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id).populate(
      "problemId",
      "title",
    );

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: "Submission not found",
      });
    }

    res.status(200).json({
      success: true,
      data: submission,
    });
  } catch (error) {
    next(error);
  }
};
