import { Queue } from "bullmq";
import dotenv from "dotenv";
dotenv.config();

function parseBool(value) {
  if (value == null) return undefined;
  const v = String(value).trim().toLowerCase();
  if (["1", "true", "yes", "y", "on"].includes(v)) return true;
  if (["0", "false", "no", "n", "off"].includes(v)) return false;
  return undefined;
}

function shouldUseTls(redisUrl) {
  const forced = parseBool(process.env.REDIS_TLS);
  if (forced !== undefined) return forced;
  return String(redisUrl || "").startsWith("rediss://");
}

export const submissionQueue = new Queue("submissionQueue", {
  connection: {
    url: (() => {
      const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
      const useTls = shouldUseTls(url);
      if (!useTls && String(url).startsWith("rediss://")) {
        return String(url).replace(/^rediss:\/\//, "redis://");
      }
      if (useTls && String(url).startsWith("redis://")) {
        return String(url).replace(/^redis:\/\//, "rediss://");
      }
      return url;
    })(),
    tls: shouldUseTls(process.env.REDIS_URL) ? {} : undefined,
  },
});
