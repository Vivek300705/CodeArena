import Problem from "../models/Problem.model.js";
import { getCache, setCache } from "../services/cache.service.js";
import logger from "../config/logger.js";

const ITERATIONS = 100;
const BENCH_CACHE_KEY = "benchmark:results";
const BENCH_CACHE_TTL = 600; // 10 minutes

/**
 * Runs ITERATIONS reads from MongoDB and from Redis cache,
 * returns timing statistics.
 */
export const runBenchmark = async () => {
  // Pick the first non-deleted problem as the benchmark subject
  const sampleProblem = await Problem.findOne({ isDeleted: false }).lean();
  if (!sampleProblem) throw new Error("No problems in DB to benchmark");

  const id = sampleProblem._id.toString();
  const cacheKey = `problem:${id}`;

  // ── MongoDB reads ────────────────────────────────────────────────────────
  const mongoTimes = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    await Problem.findById(id).lean();
    mongoTimes.push(performance.now() - t0);
  }

  // Warm the Redis cache first
  await setCache(cacheKey, sampleProblem, 3600);

  // ── Redis reads ──────────────────────────────────────────────────────────
  const redisTimes = [];
  for (let i = 0; i < ITERATIONS; i++) {
    const t0 = performance.now();
    await getCache(cacheKey);
    redisTimes.push(performance.now() - t0);
  }

  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
  const min = (arr) => Math.min(...arr);
  const max = (arr) => Math.max(...arr);

  const mongoAvg = avg(mongoTimes);
  const redisAvg = avg(redisTimes);

  return {
    iterations: ITERATIONS,
    problemId: id,
    mongo: {
      avgMs: +mongoAvg.toFixed(3),
      minMs: +min(mongoTimes).toFixed(3),
      maxMs: +max(mongoTimes).toFixed(3),
    },
    redis: {
      avgMs: +redisAvg.toFixed(3),
      minMs: +min(redisTimes).toFixed(3),
      maxMs: +max(redisTimes).toFixed(3),
    },
    speedupX: +(mongoAvg / redisAvg).toFixed(2),
    conclusion: `Redis is ${(mongoAvg / redisAvg).toFixed(1)}x faster than MongoDB for single-document reads`,
  };
};

/**
 * @desc  Run read benchmark: Redis vs MongoDB
 * @route GET /api/benchmark
 * @access Private (admin)
 */
export const benchmarkHandler = async (req, res, next) => {
  try {
    // Return cached result if available
    const cached = await getCache(BENCH_CACHE_KEY);
    if (cached) {
      return res.json({ success: true, cached: true, data: cached });
    }

    logger.info("Running Redis vs MongoDB benchmark...");
    const results = await runBenchmark();

    await setCache(BENCH_CACHE_KEY, results, BENCH_CACHE_TTL);

    res.json({ success: true, cached: false, data: results });
  } catch (error) {
    next(error);
  }
};
