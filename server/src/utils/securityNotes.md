# CodeArena — Security Audit Notes
*Day 48 | Audit Date: 2026-03-17*

---

## `npm audit` Results

```
Vulnerabilities: 0 (critical: 0, high: 0, moderate: 0, low: 0)
Total packages audited: 284
```

✅ **No known vulnerabilities in the dependency tree.**

---

## OWASP Top-10 Checklist (mapped to CodeArena)

| # | OWASP Risk | Status | How Mitigated |
|---|---|---|---|
| A01 | Broken Access Control | ✅ Mitigated | `auth` middleware (JWT verify) on all protected routes; `adminOnly` guard on admin routes |
| A02 | Cryptographic Failures | ✅ Mitigated | Passwords hashed with `bcrypt` (cost factor 10+); JWT signed with `HS256`; HTTPS enforced via HSTS header from `helmet` |
| A03 | Injection | ✅ Mitigated | `xss-clean` strips HTML/script from request bodies; `sanitizeCode` blocks shell metacharacters; Docker runs with `--cap-drop ALL --read-only --no-new-privileges`; Mongoose ODM prevents NoSQL injection |
| A04 | Insecure Design | ✅ Mitigated | Code execution isolated in ephemeral Docker containers; no user code touches host filesystem; `--network none` blocks outbound calls |
| A05 | Security Misconfiguration | ✅ Mitigated | `helmet` sets CSP, X-Frame-Options, X-Content-Type-Options, HSTS, Referrer-Policy, etc.; `legacyHeaders: false` on rate limiter; no stack traces exposed to clients (`errorHandler` returns only message) |
| A06 | Vulnerable Components | ✅ Mitigated | `npm audit` shows 0 vulnerabilities; dependencies pinned in `package-lock.json` |
| A07 | Auth & Session Failures | ✅ Mitigated | Short-lived JWTs; refresh token stored in DB with expiry; `submissionRateLimit` prevents brute-force submission spam |
| A08 | Software & Data Integrity | ⚠️ Partial | No subresource integrity on client assets (SSR not in scope); worker validates `submissionId` before DB write |
| A09 | Logging & Monitoring | ✅ Mitigated | `pino` structured logging throughout; `pino-http` request logger; rate limit breaches logged with IP/path; worker logs all verdicts |
| A10 | Server-Side Request Forgery | ✅ Mitigated | `--network none` on Docker containers; no user-controlled URL fetched by server |

---

## Auth Review

| Check | Result |
|---|---|
| Passwords not stored in plaintext | ✅ `bcrypt` |
| JWT secret in environment variable | ✅ `process.env.JWT_SECRET` |
| JWT verified on every protected route | ✅ `auth` middleware |
| Admin routes double-gated | ✅ `auth` + `adminOnly` |
| Token expiry enforced | ✅ verified in `loginUser.js` |

---

## Injection & Access Control Review

| Check | Result |
|---|---|
| Code payload size limited | ✅ 64 KB hard cap (`sanitizeCode`) |
| Shell metacharacters blocked at API | ✅ `$()`, backtick, null byte patterns |
| Docker `--cap-drop ALL` | ✅ Implemented in `submission.worker.js` |
| Docker `--read-only` filesystem | ✅ Only `/tmp` writable via `--tmpfs` |
| Docker CPU throttle | ✅ `--cpus=0.5` |
| No direct DB ID exposure to untrusted callers | ✅ All routes validate ownership before update/delete |
| CSRF | ✅ N/A — Bearer token auth, not cookie-based |

---

## Remaining Recommendations (Future Work)

- **Refresh token rotation** — issue a new refresh token on each use and revoke the old one (prevents token reuse after theft)
- **Rate limit auth endpoints** — add a separate, stricter rate limiter to `POST /auth/login` (e.g., 10 attempts / 15 min per IP)
- **JWT algorithm pinned** — explicitly pass `{ algorithms: ['HS256'] }` to `jwt.verify()` to prevent algorithm confusion attacks
- **Container image scanning** — run `docker scout` or `trivy` on the `codearena-runner` image in CI
- **Secrets rotation** — rotate `JWT_SECRET` and `MONGODB_URI` credentials periodically; consider Vault or cloud secret manager
