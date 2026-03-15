import Problem from "../models/Problem.model.js";

export const createProblem = async (req, res, next) => {
  try {
    const problem = await Problem.create(req.body);

    res.status(201).json(problem);
  } catch (error) {
    next(error);
  }
};

export const getProblems = async (req, res, next) => {
  try {
    const problems = await Problem.find();

    res.json(problems);
  } catch (error) {
    next(error);
  }
};

export const getProblemById = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);

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
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json(problem);
  } catch (error) {
    next(error);
  }
};
export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndDelete(req.params.id);

    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    res.json({ message: "Problem deleted successfully" });
  } catch (error) {
    next(error);
  }
};