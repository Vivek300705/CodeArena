/**
 * k6 Load Test — CodeArena API
 * Day 53 — Load Testing
 *
 * Run with:
 *   k6 run loadtest/k6.loadtest.js
 *   k6 run --vus 50 --duration 60s loadtest/k6.loadtest.js
 *
 * Stages:
 *  0–30s  : ramp from 0 → 50 VUs  (warm-up)
 *  30–90s : hold 50 VUs            (sustained load)
 *  90–120s: ramp from 50 → 100 VUs (stress)
 *  120–150s: ramp down to 0         (cool-down)
 */

import http from "k6/http";
import { check, sleep } from "k6";
import { Trend, Rate, Counter } from "k6/metrics";

// ── Custom Metrics ────────────────────────────────────────────────────────────
const problemsLatency = new Trend("problems_latency_ms", true);
const leaderboardLatency = new Trend("leaderboard_latency_ms", true);
const errorRate = new Rate("error_rate");
const requestCount = new Counter("total_requests");

// ── Options ───────────────────────────────────────────────────────────────────
export const options = {
  stages: [
    { duration: "30s", target: 50  },   // ramp-up
    { duration: "60s", target: 50  },   // sustained load
    { duration: "30s", target: 100 },   // stress
    { duration: "30s", target: 0   },   // cool-down
  ],
  thresholds: {
    http_req_duration:     ["p(95)<500"],   // 95% of requests under 500ms
    http_req_failed:       ["rate<0.01"],   // error rate under 1%
    problems_latency_ms:   ["p(95)<300"],   // cached problems under 300ms
    leaderboard_latency_ms:["p(95)<200"],   // leaderboard under 200ms
    error_rate:            ["rate<0.01"],
  },
};

const BASE_URL = __ENV.BASE_URL || "http://localhost:80";

// ── Virtual User Scenario ─────────────────────────────────────────────────────
export default function () {
  // 1. Health check
  const health = http.get(`${BASE_URL}/health`);
  check(health, { "health: status 200": (r) => r.status === 200 });
  requestCount.add(1);

  // 2. List problems (cached)
  const t0 = Date.now();
  const problems = http.get(`${BASE_URL}/api/problems?page=1&limit=10`);
  problemsLatency.add(Date.now() - t0);
  const ok2 = check(problems, {
    "problems: status 200": (r) => r.status === 200,
    "problems: has data":   (r) => {
      try { return JSON.parse(r.body).problems !== undefined; } catch { return false; }
    },
  });
  errorRate.add(!ok2);
  requestCount.add(1);

  sleep(0.5);

  // 3. Leaderboard (cached 60s)
  const t1 = Date.now();
  const lb = http.get(`${BASE_URL}/api/leaderboard`);
  leaderboardLatency.add(Date.now() - t1);
  const ok3 = check(lb, { "leaderboard: status 200": (r) => r.status === 200 });
  errorRate.add(!ok3);
  requestCount.add(1);

  sleep(1);
}

// ── Summary Report ─────────────────────────────────────────────────────────────
export function handleSummary(data) {
  const summary = {
    testDate: new Date().toISOString(),
    totalRequests: data.metrics.iterations?.values?.count ?? 0,
    p50_ms: data.metrics.http_req_duration?.values?.["p(50)"] ?? 0,
    p95_ms: data.metrics.http_req_duration?.values?.["p(95)"] ?? 0,
    p99_ms: data.metrics.http_req_duration?.values?.["p(99)"] ?? 0,
    errorRate_pct: (data.metrics.http_req_failed?.values?.rate ?? 0) * 100,
    problems_p95_ms: data.metrics.problems_latency_ms?.values?.["p(95)"] ?? 0,
    leaderboard_p95_ms: data.metrics.leaderboard_latency_ms?.values?.["p(95)"] ?? 0,
  };

  console.log("\n📊 Load Test Summary:");
  console.log(JSON.stringify(summary, null, 2));

  return {
    "loadtest/results.json": JSON.stringify(data, null, 2),
    stdout: `\n📊 p95: ${summary.p95_ms.toFixed(1)}ms | errors: ${summary.errorRate_pct.toFixed(2)}%\n`,
  };
}
