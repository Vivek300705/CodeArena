import swaggerJsdoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "CodeArena API",
      version: "1.0.0",
      description:
        "REST API for CodeArena — a competitive programming contest platform. " +
        "Supports problem management, code submission judging, real-time verdict delivery " +
        "via WebSockets, and a global leaderboard.",
      contact: { name: "CodeArena", email: "admin@codearena.dev" },
      license: { name: "MIT" },
    },
    servers: [
      { url: "http://localhost:8000", description: "Local development" },
      { url: "http://localhost:80",   description: "Docker Compose (via Nginx)" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT access token from POST /auth/login",
        },
      },
      schemas: {
        Problem: {
          type: "object",
          properties: {
            _id:         { type: "string", example: "661abc123def456789abcdef" },
            title:       { type: "string", example: "Two Sum" },
            slug:        { type: "string", example: "two-sum" },
            description: { type: "string" },
            difficulty:  { type: "string", enum: ["easy", "medium", "hard"] },
            tags:        { type: "array", items: { type: "string" } },
            timeLimit:   { type: "integer", example: 1000, description: "ms" },
            memoryLimit: { type: "integer", example: 256, description: "MB" },
          },
        },
        Submission: {
          type: "object",
          properties: {
            _id:        { type: "string" },
            problemId:  { type: "string" },
            userId:     { type: "string" },
            language:   { type: "string", enum: ["cpp","c","java","python","node","go","rust"] },
            status:     { type: "string", enum: ["queued","processing","completed","failed"] },
            verdict:    { type: "string", enum: ["Accepted","Wrong Answer","Time Limit Exceeded","Runtime Error","Compilation Error"] },
            runtime:    { type: "integer", description: "ms" },
            createdAt:  { type: "string", format: "date-time" },
          },
        },
        Error: {
          type: "object",
          properties: {
            status:  { type: "string", example: "error" },
            message: { type: "string", example: "Detailed error description" },
          },
        },
        LeaderboardEntry: {
          type: "object",
          properties: {
            rank:   { type: "integer", example: 1 },
            userId: { type: "string" },
            score:  { type: "number", example: 80 },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  // Scan all route and controller files for JSDoc @swagger annotations
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

export const swaggerSpec = swaggerJsdoc(options);
