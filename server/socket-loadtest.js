/**
 * Day 37 — Socket Load Test
 * ─────────────────────────
 * Simulates N concurrent Socket.IO clients connecting to the API server.
 * After all clients connect, it publishes a fake SUBMISSION_UPDATED event
 * via Redis and measures how long each client takes to receive it.
 *
 * Usage:
 *   node socket-loadtest.js [numClients] [serverUrl]
 *
 * Defaults: 50 clients, http://localhost:8000
 *
 * Requires the API server to be running: npm run dev (in server/)
 */

import { io } from "socket.io-client";
import { createClient } from "redis";

const NUM_CLIENTS = parseInt(process.argv[2] || "50", 10);
const SERVER_URL = process.argv[3] || "http://localhost:8000";
const REDIS_URL = "redis://127.0.0.1:6379";

// Fake IDs for testing — all clients share one room to receive the same event
const FAKE_USER_ID = "loadtest-user-001";
const FAKE_SUBMISSION_ID = "loadtest-submission-001";

// ─── Stats ─────────────────────────────────────────────────────────────────
let connectedCount = 0;
let receivedCount = 0;
const latencies = [];
let publishTime = null;

// ─── Create N clients ───────────────────────────────────────────────────────
console.log(`\n⚡ CodeArena Socket Load Test`);
console.log(`   Clients : ${NUM_CLIENTS}`);
console.log(`   Server  : ${SERVER_URL}`);
console.log(`   Redis   : ${REDIS_URL}\n`);

const clients = Array.from({ length: NUM_CLIENTS }, (_, i) => {
  const socket = io(SERVER_URL, {
    query: { userId: FAKE_USER_ID },
    reconnection: false,
    transports: ["websocket"],
  });

  socket.on("connect", () => {
    connectedCount++;
    if (connectedCount === NUM_CLIENTS) {
      console.log(`✅ All ${NUM_CLIENTS} clients connected. Publishing test event...\n`);
      publishTestEvent();
    }
  });

  socket.on("submission_update", (data) => {
    if (data.submissionId !== FAKE_SUBMISSION_ID) return;
    const latency = Date.now() - publishTime;
    latencies.push(latency);
    receivedCount++;

    if (receivedCount === NUM_CLIENTS) {
      printResults();
      clients.forEach((c) => c.disconnect());
      process.exit(0);
    }
  });

  socket.on("connect_error", (err) => {
    console.error(`Client ${i + 1} failed: ${err.message}`);
  });

  return socket;
});

// ─── Timeout safety ─────────────────────────────────────────────────────────
setTimeout(() => {
  console.warn(`\n⚠️  Timeout! Only ${receivedCount}/${NUM_CLIENTS} clients received the event.`);
  printResults(true);
  clients.forEach((c) => c.disconnect());
  process.exit(1);
}, 15000);

// ─── Publish via Redis (mirrors what the worker does) ───────────────────────
async function publishTestEvent() {
  const redis = createClient({ url: REDIS_URL });
  await redis.connect();
  publishTime = Date.now();

  await redis.publish(
    "SUBMISSION_UPDATED",
    JSON.stringify({
      submissionId: FAKE_SUBMISSION_ID,
      userId: FAKE_USER_ID,
      verdict: "Accepted",
      status: "completed",
    })
  );

  await redis.disconnect();
}

// ─── Results printer ────────────────────────────────────────────────────────
function printResults(partial = false) {
  if (latencies.length === 0) {
    console.log("❌ No events received.");
    return;
  }

  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const successRate = ((receivedCount / NUM_CLIENTS) * 100).toFixed(1);

  console.log("─".repeat(45));
  console.log(`  📊 Load Test Results${partial ? " (partial)" : ""}`);
  console.log("─".repeat(45));
  console.log(`  Clients connected  : ${connectedCount}/${NUM_CLIENTS}`);
  console.log(`  Events received    : ${receivedCount}/${NUM_CLIENTS}`);
  console.log(`  Success rate       : ${successRate}%`);
  console.log(`  Latency — min      : ${min} ms`);
  console.log(`  Latency — avg      : ${avg} ms`);
  console.log(`  Latency — max      : ${max} ms`);
  console.log("─".repeat(45));
}
