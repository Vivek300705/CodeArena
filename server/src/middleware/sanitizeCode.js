/**
 * Code Sanitization Middleware
 *
 * Validates user-submitted code before it reaches the queue:
 *  1. Enforces max payload size (64 KB)
 *  2. Blocks shell-escape patterns that could escape the Docker sandbox
 *
 * Note: The Docker container itself is the primary execution sandbox.
 * This middleware provides a defence-in-depth layer at the API boundary.
 */

const MAX_CODE_BYTES = 64 * 1024; // 64 KB

/**
 * Patterns that could be used to escape the container or inject OS commands
 * by exploiting the shell execution inside Docker.
 * These are NOT normal language constructs — they're shell metacharacters.
 */
const BLOCKED_PATTERNS = [
  // Command substitution
  { pattern: /\$\(/, label: "command substitution $(...)" },
  { pattern: /`[^`]*`/, label: "backtick command substitution" },
  // Null byte (path traversal / injection)
  { pattern: /\x00/, label: "null byte" },
];

const sanitizeCode = (req, res, next) => {
  const { code } = req.body;

  if (!code) return next(); // let controller validation handle missing code

  // 1. Size check
  const codeBytes = Buffer.byteLength(code, "utf8");
  if (codeBytes > MAX_CODE_BYTES) {
    return res.status(400).json({
      success: false,
      message: `Code exceeds maximum allowed size of ${MAX_CODE_BYTES / 1024} KB.`,
    });
  }

  // 2. Shell injection patterns
  for (const { pattern, label } of BLOCKED_PATTERNS) {
    if (pattern.test(code)) {
      return res.status(400).json({
        success: false,
        message: `Submission rejected: code contains disallowed pattern (${label}).`,
      });
    }
  }

  next();
};

export default sanitizeCode;
