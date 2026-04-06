<div align="center">

```
 ██████╗ ██████╗ ██████╗ ███████╗ █████╗ ██████╗ ███████╗███╗   ██╗ █████╗ 
██╔════╝██╔═══██╗██╔══██╗██╔════╝██╔══██╗██╔══██╗██╔════╝████╗  ██║██╔══██╗
██║     ██║   ██║██║  ██║█████╗  ███████║██████╔╝█████╗  ██╔██╗ ██║███████║
██║     ██║   ██║██║  ██║██╔══╝  ██╔══██║██╔══██╗██╔══╝  ██║╚██╗██║██╔══██║
╚██████╗╚██████╔╝██████╔╝███████╗██║  ██║██║  ██║███████╗██║ ╚████║██║  ██║
 ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═══╝╚═╝  ╚═╝
```

### ⚔️ &nbsp; FORGE · COMPETE · CONQUER &nbsp; ⚔️

*A full-stack competitive programming platform with real-time 1v1 coding duels,*
*a multi-language code judge, live leaderboards, and a sleek cyberpunk UI.*

<br/>

[![React](https://img.shields.io/badge/React_19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
[![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge)](CONTRIBUTING.md)
[![Swagger](https://img.shields.io/badge/Swagger-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](http://localhost:8000/api-docs)

</div>

---

## 📋 Table of Contents

- [✨ Features](#-features)
- [🚀 Tech Stack](#-tech-stack)
- [📁 Project Structure](#-project-structure)
- [🛠️ Getting Started](#️-getting-started)
- [🐳 Docker Compose](#-docker-compose-full-stack)
- [📖 API Documentation](#-api-documentation)
- [⚔️ Duel System](#️-duel-system)
- [🤖 AI Problem Generator](#-ai-problem-generator)
- [🧪 Load Testing](#-load-testing)
- [🔒 Security](#-security)
- [☁️ Deployment](#️-deployment-render)
- [🤝 Contributing](#-contributing)
- [📄 License](#-license)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🏟️ **Practice Arena** | 1,000+ algorithm problems with difficulty filters, tag search, and pagination |
| ⚔️ **Real-time Duels** | 1v1 matches with 3 problems, live scoring, ELO rating, and powerups |
| 🌍 **Multi-language Judge** | C++, Python, Java, Node.js, C, Go, Rust in isolated Docker containers |
| 📝 **Monaco Editor** | Syntax highlighting, language boilerplates, smooth cursor experience |
| ⚡ **Live Verdicts** | Results pushed via Socket.io with polling fallback |
| 🏆 **Global Leaderboard** | Redis sorted sets, cached every 60s, with personal rank |
| 🛠️ **Admin Dashboard** | Create/edit/delete problems with testcases and boilerplates |
| 🤖 **AI Problem Generator** | Gemini API generates problems with testcases and driver code |
| 🎮 **3D UI** | Three.js torus knot hero, particle fields, custom cursor, ember particles |
| 🔒 **Security First** | Rate limiting, code sanitization, `--cap-drop ALL` Docker sandbox, Helmet |

---

## 🚀 Tech Stack

### 🖥️ Frontend — `/client`

| Technology | Purpose |
|---|---|
| ⚛️ React 19 + Vite 8 | UI framework & build tool |
| 🎨 Tailwind CSS 3 | Utility-first styling |
| 🎞️ Framer Motion | Animations & transitions |
| 📝 Monaco Editor | In-browser code editor |
| 🌐 Three.js / R3F / Drei | 3D hero scenes |
| 🌀 Spline | Interactive 3D backgrounds |
| 🔌 Socket.io-client | Real-time WebSocket connection |
| 🗃️ Zustand | Global auth state |
| 🧭 React Router v7 | Client-side routing |
| ✅ React Hook Form + Zod | Form validation |
| 📡 Axios | HTTP requests |

### ⚙️ Backend — `/server`

| Technology | Purpose |
|---|---|
| 🚀 Node.js + Express 5 | REST API server |
| 🍃 MongoDB + Mongoose | Primary database |
| ⚡ Redis | Caching, leaderboard (sorted sets), pub/sub, rate limiting |
| 📬 BullMQ | Submission job queue |
| 🔌 Socket.io | Real-time verdict delivery & duel events |
| 🐳 Docker | Sandboxed code execution |
| 🔐 JWT + bcrypt | Auth & password hashing |
| 📋 Pino | Structured logging |
| 🛡️ Zod | Request validation |
| 📖 Swagger (JSDoc) | API documentation |

### 🏗️ Infrastructure

| Technology | Purpose |
|---|---|
| 🐳 Docker Compose | Multi-service orchestration |
| 🔀 Nginx | Reverse proxy, rate limiting, WebSocket upgrade |
| 🔄 PM2 | Process management (`ecosystem.config.js`) |
| ☁️ Render | Cloud deployment (`render.yaml`) |
| 📊 k6 | Load testing |

---

## 📁 Project Structure

```
CodeArena/
├── client/                  # ⚛️  React + Vite frontend
│   ├── src/
│   │   ├── components/      # UI components (Navbar, Editor, etc.)
│   │   ├── pages/           # Route pages (Landing, Dashboard, Duel, etc.)
│   │   ├── services/        # API + socket service layer
│   │   ├── store/           # Zustand auth store
│   │   ├── hooks/           # Custom hooks (useSocket, useCountUp, etc.)
│   │   ├── layouts/         # MainLayout with Navbar + particles
│   │   ├── animations/      # Framer Motion variants
│   │   └── styles/          # Global CSS, typography, component styles
│   └── public/              # Static assets, favicon, sitemap
│
├── server/                  # ⚙️  Node.js + Express backend
│   └── src/
│       ├── config/          # DB, Redis, logger, Swagger
│       ├── controllers/     # Route handlers
│       ├── middleware/      # Auth, rate limit, sanitize, validate
│       ├── models/          # Mongoose schemas
│       ├── routes/          # Express routers
│       ├── services/        # Business logic (duel, leaderboard, ELO)
│       ├── queues/          # BullMQ submission queue
│       ├── workers/         # Submission judge worker
│       └── utils/           # Socket.io init, AppError, ProblemBuilder
│
├── nginx/                   # 🔀 Nginx config
├── loadtest/                # 📊 k6 load test scripts
├── docker-compose.yml       # 🐳 Full stack orchestration
├── render.yaml              # ☁️  Render deployment config
└── ecosystem.config.js      # 🔄 PM2 config
```

---

## 🛠️ Getting Started

### Prerequisites

> Make sure you have these installed before proceeding.

- ![Node](https://img.shields.io/badge/Node.js-≥20-339933?logo=nodedotjs&logoColor=white)
- ![Docker](https://img.shields.io/badge/Docker-latest-2496ED?logo=docker&logoColor=white)
- ![MongoDB](https://img.shields.io/badge/MongoDB-local_or_Atlas-47A248?logo=mongodb&logoColor=white)
- ![Redis](https://img.shields.io/badge/Redis-local_or_managed-DC382D?logo=redis&logoColor=white)

---

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/your-username/codearena.git
cd codearena
```

### 2️⃣ Configure Environment Variables

**Backend** — create `server/.env`:

```env
# ── Required ──────────────────────────────
PORT=8000
MONGODB_URI=mongodb://localhost:27017/codearena
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_key
NODE_ENV=development

# ── Optional: AI Problem Generator ────────
GEMINI_API_KEY=your_gemini_api_key

# ── Optional: Email (Forgot Password) ─────
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=your_email
SMTP_PASSWORD=your_password
```

**Frontend** — create `client/.env`:

```env
VITE_API_URL=http://localhost:8000
```

### 3️⃣ Build the Docker Runner Image

```bash
cd server
docker build -f Dockerfile.runner -t codearena-runner .
```

### 4️⃣ Start the Backend

```bash
cd server
npm install
npm run dev        # Development (nodemon)
# OR
npm start          # Production
```

### 5️⃣ Start the Frontend

```bash
cd client
npm install
npm run dev        # → http://localhost:5173
```

### 6️⃣ Start the Submission Worker

```bash
# Open a separate terminal
cd server
node src/workers/submission.worker.js
```

---

## 🐳 Docker Compose (Full Stack)

Run the **entire platform** — API, worker, MongoDB, Redis, and Nginx — with one command:

```bash
# Build and start all services
docker compose up --build

# Scale API horizontally (3 replicas)
docker compose up --build --scale api=3

# Run in background
docker compose up -d
```

> 🌐 App available at **`http://localhost:80`**

| Service | Port |
|---|---|
| 🔀 Nginx (reverse proxy) | `80` |
| ⚙️ API | `8000` (internal) |
| 🍃 MongoDB | `27017` (internal) |
| ⚡ Redis | `6379` (internal) |

---

## 📖 API Documentation

```
Swagger UI  →  http://localhost:8000/api-docs
OpenAPI JSON →  http://localhost:8000/api-docs.json
```

### Key Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| `POST` | `/auth/register` | Register new user | 🌐 Public |
| `POST` | `/auth/login` | Login, get JWT | 🌐 Public |
| `POST` | `/auth/forgotpassword` | Send reset email | 🌐 Public |
| `GET` | `/api/problems` | List problems (paginated) | 🌐 Public |
| `GET` | `/api/problems/:id` | Get problem by ID | 🌐 Public |
| `POST` | `/api/problems` | Create problem | 🔴 Admin |
| `POST` | `/api/v1/submissions` | Submit code for judging | 🔑 Auth |
| `GET` | `/api/v1/submissions` | Get my submissions | 🔑 Auth |
| `GET` | `/api/leaderboard` | Global leaderboard | 🌐 Public |
| `GET` | `/api/leaderboard/me` | My rank & score | 🔑 Auth |
| `POST` | `/api/v1/duel/challenge` | Create a duel | 🔑 Auth |
| `POST` | `/api/v1/duel/accept` | Join a duel | 🔑 Auth |
| `GET` | `/health` | Health check | 🌐 Public |
| `GET` | `/metrics` | System metrics | 🌐 Public |

---

## ⚔️ Duel System

```
Player 1                          Player 2
   │                                  │
   │── "Forge a Match" ──────────────>│
   │<── Match Signature (Duel ID) ────│
   │                                  │
   │──── Enter Signature ────────────>│
   │         Both enter the Arena     │
   │                                  │
   │<──── 3 Problems Assigned ───────>│
   │   (1 Easy · 1 Medium · 1 Hard)   │
   │                                  │
   │<──── Live Scoring via WS ───────>│
   │                                  │
   └──────── ELO Update ─────────────┘
```

### 🎯 Scoring

| Event | Points |
|---|---|
| ✅ Easy problem solved | `+100 pts` |
| ✅ Medium problem solved | `+200 pts` |
| ✅ Hard problem solved | `+300 pts` |
| ⚡ First to solve bonus | `+50 pts` |
| 🧼 Clean solve (no wrong attempts) | `+30 pts` |
| ⏱️ Time penalty | `−2 pts/min` |
| ❌ Wrong answer | `−20 pts` |

### 🔮 Powerups

| Powerup | Effect |
|---|---|
| 🔇 **Jam Sensor** | Freeze opponent's editor temporarily |
| ⚡ **Overclock** | Receive a hint for the current problem |

---

## 🤖 AI Problem Generator

Generate problems automatically using **Google Gemini**:

```bash
cd server
node ai_generator.js "Given an array of integers and a target sum, find two indices that add up to the target."
```

The AI will generate:

- 📌 Title & description
- 🎯 Difficulty & tags
- 📋 Examples & constraints
- 🧪 Testcases
- 💻 Boilerplates for **C++, Python, Java, Node.js**

---

## 🧪 Load Testing

```bash
# Install k6: https://k6.io/docs/get-started/installation/

# Ramp 0 → 50 → 100 VUs
k6 run loadtest/k6.loadtest.js

# Custom VUs & duration
k6 run --vus 100 --duration 60s loadtest/k6.loadtest.js

# Target deployed instance
k6 run -e BASE_URL=https://your-domain.com loadtest/k6.loadtest.js
```

### 🎯 SLO Targets

| Metric | Target |
|---|---|
| p95 latency | `< 500ms` |
| Error rate | `< 1%` |
| Leaderboard p95 (cached) | `< 200ms` |
| Problems p95 (cached) | `< 300ms` |

---

## 🔒 Security

| Layer | Implementation |
|---|---|
| 🐳 **Code Sandbox** | `--cap-drop ALL`, `--read-only`, `--network none`, `--cpus=0.5`, memory-limited |
| 🚦 **Rate Limiting** | Global 200 req/15min (Redis + Nginx), submissions 5/60s sliding window |
| 🧹 **Code Sanitization** | Blocks `$()`, backticks, null bytes — 64KB size limit |
| 🔑 **Auth** | JWT (15min access) + refresh tokens in DB |
| 🛡️ **Headers** | Helmet — CSP, HSTS, X-Frame-Options, etc. |
| ✅ **Input Validation** | Zod schemas on all endpoints |

---

## ☁️ Deployment (Render)

The `render.yaml` defines two services:

| Service | Type | Description |
|---|---|---|
| 🌐 `codearena-api` | Web Service | Node.js REST API |
| ⚙️ `codearena-worker` | Background Worker | Docker submission judge |

**Set these in the Render dashboard:**

```
MONGODB_URI   →  your Atlas connection string
REDIS_URL     →  your managed Redis URL
JWT_SECRET    →  auto-generated secret
```

> ⚠️ **Important:** Set `USE_DOCKER=false` on Render — Docker-in-Docker is not supported. The worker runs in sandbox mode.

---

## 🤝 Contributing

Contributions are welcome! Here's how to get started:

```bash
# 1. Fork the repo on GitHub

# 2. Create your feature branch
git checkout -b feature/your-amazing-feature

# 3. Commit your changes
git commit -m 'feat: add your amazing feature'

# 4. Push to your branch
git push origin feature/your-amazing-feature

# 5. Open a Pull Request 🎉
```

Please make sure your code:
- ✅ Follows the existing code style
- ✅ Includes relevant tests
- ✅ Updates documentation if needed

---

## 📄 License

```
MIT License — Copyright © CodeArena
```

Permission is hereby granted, free of charge, to any person obtaining a copy of this software to deal in the Software without restriction, including the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software.

---

<div align="center">

**Built with ❤️ and a lot of ☕**

```
 < / >   FORGE · COMPETE · CONQUER   < / >
```

⭐ **Star this repo if you find it useful!** ⭐

[![GitHub stars](https://img.shields.io/github/stars/your-username/codearena?style=social)](https://github.com/your-username/codearena)
[![GitHub forks](https://img.shields.io/github/forks/your-username/codearena?style=social)](https://github.com/your-username/codearena/fork)

</div>
