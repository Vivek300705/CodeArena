import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Logger configuration:
 *  - Development: pino-pretty (coloured, human-readable)
 *  - Production:  raw JSON to stdout → Promtail/Loki or CloudWatch agent
 *    picks it up via the container log driver.
 *
 * Log aggregation:
 *  Loki — add the Promtail or Loki Docker driver in docker-compose.yml
 *  CloudWatch — set the `awslogs` log driver on each service
 */
const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    base: {
      service: process.env.SERVICE_NAME || "codearena-api",
      env: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    },
    // Redact sensitive fields from log output
    redact: {
      paths: ["req.headers.authorization", "req.headers.cookie", "*.password"],
      censor: "[REDACTED]",
    },
    timestamp: pino.stdTimeFunctions.isoTime,
    formatters: {
      level(label) {
        return { level: label }; // use string levels ("info") instead of ints
      },
    },
    // In production serialize errors fully
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
  },
  // Transport: pretty in dev, raw JSON in production
  isProduction
    ? undefined // raw JSON to stdout — captured by Docker log driver
    : pino.transport({
        target: "pino-pretty",
        options: { colorize: true, translateTime: "SYS:standard" },
      }),
);

export default logger;
