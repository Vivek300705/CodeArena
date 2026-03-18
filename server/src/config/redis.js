import { createClient } from "redis";
import dotenv from "dotenv";
import logger from "./logger.js";

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

function isTlsPlaintextMismatch(err) {
  const msg = (err?.message || String(err || "")).toLowerCase();
  return (
    msg.includes("packet length too long") ||
    msg.includes("wrong version number") ||
    msg.includes("unknown protocol") ||
    msg.includes("tls_get_more_records")
  );
}

export function createRedisClient({ url = process.env.REDIS_URL, tls } = {}) {
  const desiredTls = tls ?? shouldUseTls(url);
  // node-redis also infers TLS from the URL scheme; keep them consistent.
  const normalizedUrl =
    desiredTls === false && String(url || "").startsWith("rediss://")
      ? String(url).replace(/^rediss:\/\//, "redis://")
      : desiredTls === true && String(url || "").startsWith("redis://")
        ? String(url).replace(/^redis:\/\//, "rediss://")
        : url;
  const useTls = desiredTls;
  return createClient({
    url: normalizedUrl,
    socket: useTls
      ? {
          tls: true,
          // Many managed Redis providers use custom CAs; allow override via env.
          rejectUnauthorized: parseBool(process.env.REDIS_REJECT_UNAUTHORIZED) ?? false,
        }
      : undefined,
  });
}

let currentClient = createRedisClient();

function attachLogging(client) {
  client.on("connect", () => {
    logger.info("✅ Redis client connected");
  });

  client.on("error", (err) => {
    logger.error({ err: err.message }, "Redis Client Error");
  });

  client.on("reconnecting", () => {
    logger.warn("🔄 Redis client reconnecting...");
  });
}

attachLogging(currentClient);

let connectingPromise = null;
async function safeConnect() {
  if (currentClient.isReady) return;
  if (connectingPromise) return connectingPromise;

  connectingPromise = (async () => {
    try {
      const url = process.env.REDIS_URL;
      const useTls = shouldUseTls(url);

      const connectPromise = currentClient.connect();

      // node-redis can keep `connect()` pending while it auto-reconnects.
      // If the URL is mis-schemed (TLS to plaintext), we detect the first
      // TLS-mismatch error and trigger a controlled fallback.
      const tlsMismatchPromise =
        useTls
          ? new Promise((_, reject) => {
              const onError = (err) => {
                if (isTlsPlaintextMismatch(err)) {
                  currentClient.off("error", onError);
                  reject(err);
                }
              };
              currentClient.on("error", onError);
              connectPromise.finally(() => currentClient.off("error", onError));
            })
          : new Promise(() => {});

      await Promise.race([connectPromise, tlsMismatchPromise]);
    } catch (err) {
      const url = process.env.REDIS_URL;
      const useTls = shouldUseTls(url);
      const allowFallback = parseBool(process.env.REDIS_TLS_FALLBACK) ?? true;

      if (useTls && allowFallback && isTlsPlaintextMismatch(err)) {
        logger.warn(
          { err: err.message },
          "Redis TLS handshake failed; retrying without TLS (check REDIS_URL scheme)"
        );

        try {
          currentClient.disconnect();
        } catch {
          // ignore
        }

        currentClient = createRedisClient({ url, tls: false });
        attachLogging(currentClient);
        await currentClient.connect();
      } else {
        throw err;
      }
    } finally {
      connectingPromise = null;
    }
  })();

  return connectingPromise;
}

const redisClient = new Proxy(
  { safeConnect },
  {
    get(target, prop) {
      if (prop in target) return target[prop];
      const value = currentClient[prop];
      if (typeof value === "function") return value.bind(currentClient);
      return value;
    },
    set(target, prop, value) {
      if (prop in target) {
        target[prop] = value;
        return true;
      }
      currentClient[prop] = value;
      return true;
    },
  }
);

export default redisClient;
