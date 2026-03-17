import Problem from "../models/Problem.model.js";
import {
  getCache,
  setCache,
  deleteCache,
  deleteCacheByPattern,
} from "../services/cache.service.js";

const PROBLEM_TTL = 3600; // 1 hour
const LIST_TTL = 300;     // 5 minutes for paginated lists

const problemKey = (id) => `problem:${id}`;
const slugKey = (slug) => `problem:slug:${slug}`;
const listKey = (query) => `problems:list:${JSON.stringify(query)}`;

export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create({
      ...req.body,
      createdBy: req.user.userId,
    });

    // Bust any cached problem lists
    await deleteCacheByPattern("problems:list:*");

    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
};

export const getProblems = async (req, res, next) => {
  try {
    const { difficulty, tags, page = 1, limit = 10 } = req.query;
    const cacheKey = listKey({ difficulty, tags, page, limit });

    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const filter = { isDeleted: false };
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(",") };

    const skip = (page - 1) * limit;

    const [problems, total] = await Promise.all([
      Problem.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Problem.countDocuments(filter),
    ]);

    const result = { total, page: Number(page), limit: Number(limit), problems };
    await setCache(cacheKey, result, LIST_TTL);

    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  try {
    const cacheKey = problemKey(req.params.id);
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const problem = await Problem.findOne({
      _id: req.params.id,
      isDeleted: false,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await setCache(cacheKey, problem, PROBLEM_TTL);
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
      return res.status(403).json({ message: "You cannot update this problem" });
    }

    Object.assign(problem, req.body);
    await problem.save();

    // Invalidate caches
    await Promise.all([
      deleteCache(problemKey(req.params.id)),
      deleteCache(slugKey(problem.slug)),
      deleteCacheByPattern("problems:list:*"),
    ]);

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
      return res.status(403).json({ message: "You cannot delete this problem" });
    }

    problem.isDeleted = true;
    await problem.save();

    // Invalidate caches
    await Promise.all([
      deleteCache(problemKey(req.params.id)),
      deleteCache(slugKey(problem.slug)),
      deleteCacheByPattern("problems:list:*"),
    ]);

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const getProblemBySlug = async (req, res, next) => {
  try {
    const cacheKey = slugKey(req.params.slug);
    const cached = await getCache(cacheKey);
    if (cached) return res.json(cached);

    const problem = await Problem.findOne({
      slug: req.params.slug,
      isDeleted: false,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    await setCache(cacheKey, problem, PROBLEM_TTL);
    res.json(problem);
  } catch (error) {
    next(error);
  }
};