import Problem from "../models/Problem.model.js";
export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
};

export const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tags, page = 1, limit = 10 } = req.query;

    const filter = { isDeleted: false };

    if (difficulty) {
      filter.difficulty = difficulty;
    }

    if (tags) {
      filter.tags = { $in: tags.split(",") };
    }

    const skip = (page - 1) * limit;

    const problems = await Problem.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Problem.countDocuments(filter);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      problems,
    });
  } catch (error) {
    next(error);
  }
};
export const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    next(error);
  }
};
export const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You cannot update this problem",
      });
    }

    Object.assign(problem, req.body);

    await problem.save();

    res.json(problem);
  } catch (error) {
    next(error);
  }
};
export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    if (problem.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({
        message: "You cannot delete this problem",
      });
    }

    problem.isDeleted = true;

    await problem.save();

    res.json({
      message: "Problem deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
export const getProblemBySlug = async (req, res, next) => {
  try {
    const problem = await Problem.findOne({
      slug: req.params.slug,
      isDeleted: false,
    });

    res.json(problem);
  } catch (error) {
    next(error);
  }
};