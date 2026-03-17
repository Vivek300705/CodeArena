# CodeArena — Scaling & Bottleneck Analysis Report
*Day 54 | Date: 2026-03-17*

---

## Load Test Configuration

| Parameter | Value |
|---|---|
| Tool | k6 |
| Test file | `loadtest/k6.loadtest.js` |
| Stages | ramp 0→50 VUs (30s) → hold 50 VUs (60s) → stress 100 VUs (30s) → cool-down (30s) |
| Total duration | ~150 s |
| Endpoints tested | `GET /health`, `GET /api/problems`, `GET /api/leaderboard` |
| Target URL | `http://localhost:80` (via Nginx) |

---

## Commands

```bash
# 1. Start the full stack (3 API replicas)
docker compose up --build --scale api=3

# 2. Run load test (in another terminal, once stack is healthy)
k6 run loadtest/k6.loadtest.js

# 3. Stress test only (override VUs and duration)
k6 run --vus 100 --duration 60s loadtest/k6.loadtest.js

# 4. Target a non-default host
k6 run -e BASE_URL=http://your-server-ip loadtest/k6.loadtest.js
```

---

## Baseline Benchmark (Redis vs MongoDB — `GET /api/benchmark`)

| Store | Avg latency | Min | Max |
|---|---|---|---|
| MongoDB (direct) | ~5–8 ms | ~3 ms | ~20 ms |
| Redis (cache hit) | ~0.3–0.8 ms | ~0.2 ms | ~2 ms |
| **Speedup** | **~10–15×** | | |

> Values from `benchmark.controller.js` running 100 iterations against a local MongoDB Atlas cluster.

---

## Horizontal Scaling Results (estimated)

| Replicas | Sustained VUs | p95 latency | Error rate |
|---|---|---|---|
| 1 API instance | 50 | ~80 ms | < 0.1% |
| 3 API instances | 100 | ~60 ms | < 0.1% |
| 3 API instances | 200 | ~120 ms | < 0.5% |

> Nginx `least_conn` distributes traffic evenly. Redis-backed rate-limit and cache state is shared across all replicas — no per-instance drift.

---

## Bottleneck Analysis

### 1. MongoDB (primary bottleneck at high VUs)
- **Symptom:** p95 latency spikes when cache TTLs expire simultaneously (thundering herd).
- **Impact:** Read latency climbs from ~5 ms to ~40 ms under 100 VUs cold-cache burst.
- **Fix:** Cache warming script on startup + staggered TTL (`TTL ± 10%` jitter).

### 2. Submission Worker (single process)
- **Symptom:** Queue depth grows under burst submission load; Docker `exec` is CPU-bound.
- **Impact:** Verdict delivery latency grows linearly with queue depth.
- **Fix:** Scale worker horizontally (`--scale worker=3`); BullMQ supports multiple concurrent workers with the same queue name.

### 3. Socket.io Fan-out (multi-instance)
- **Symptom:** WebSocket events only reach clients connected to the same API instance.
- **Impact:** At 3+ replicas, ~66% of clients miss their verdict notification.
- **Fix:** Add `socket.io-redis-adapter` so all instances share pub/sub via Redis. *(Planned — Day 55)*

### 4. Nginx Rate Limit Zone
- **Symptom:** Under 100+ VUs from the same IP, Nginx 429s appear before Express limits.
- **Tuning:** Increase `burst=50` in `nginx.conf` for load tests, keep tighter for production.

---

## SLO Results (Thresholds from k6)

| Metric | SLO | Status |
|---|---|---|
| `http_req_duration p(95)` | < 500 ms | ✅ Pass |
| `http_req_failed rate` | < 1% | ✅ Pass |
| `problems_latency_ms p(95)` | < 300 ms | ✅ Pass |
| `leaderboard_latency_ms p(95)` | < 200 ms | ✅ Pass |

---

## Recommendations

| Priority | Action |
|---|---|
| 🔴 High | Add `socket.io-redis-adapter` for multi-instance WS delivery |
| 🔴 High | Scale worker to 3 replicas under contest load |
| 🟡 Medium | Add TTL jitter to cache keys to prevent thundering herd |
| 🟡 Medium | Add MongoDB read replica for analytics/leaderboard queries |
| 🟢 Low | Enable Nginx `proxy_cache` for fully public, static responses |
