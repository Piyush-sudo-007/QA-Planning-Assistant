# Agentic QA Planning Assistant 🤖✨

An AI-powered Quality Assurance Planning Assistant designed for modern software development teams. Given a developer's **feature requirement**, **acceptance criteria**, and **implementation summary**, the AI agent cross-references a knowledge base of QA standards and generates a multi-tier test suite (Unit, API, Integration, Playwright E2E, and Manual QA), computes deterministic acceptance criteria coverage, detects duplicate/incomplete tests, and allows interactive human review.

---

## 🚀 Live Demo & Deployment

- **Public Hosted Application**: Deployable directly to **Vercel** with zero-configuration serverless functions.
- **Repository Setup**: Fully configured with `vercel.json`, single `package.json`, and static SPA asset compilation.

---

## 🔑 Key Features

1. **Multi-Stage Agentic AI Workflow**:
   - **Knowledge Retrieval**: Retrieves relevant QA guidelines from a local markdown knowledge base using TF-IDF term-frequency scoring.
   - **Flow & Boundary Identification**: Extracts happy paths, edge cases, permission limits, failure states, and regression risks.
   - **Test Generation**: Generates Unit, REST API, Integration, Playwright E2E, and Manual QA test cases mapped directly to acceptance criteria indices.
   - **AI Context Assumptions**: Explicitly tags assumptions made when input context is incomplete.

2. **Deterministic Acceptance Criteria Coverage**:
   - Pure mathematical mapping logic — no hallucinated coverage metrics.
   - Highlights uncovered acceptance criteria in red.

3. **Human-in-the-Loop Review**:
   - Developers can Approve (✓), Reject (✗), Edit (✏️), or Reprioritize test cases.
   - Live coverage recalculation as developers review test cases.

4. **Real-time Collaboration & Versioning**:
   - Short-polling sync detects concurrent updates by team members.
   - Multi-version plan saving with version history timeline.

5. **Structured Logging & Telemetry**:
   - Detailed LLM telemetry tracking model used, prompt tokens, execution latency, and JSON payload logs.

---

## 🛠️ Architecture & Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend** | React 18, Vite, Lucide Icons | Fast SPA rendering, dark mode glassmorphism theme, smooth animations |
| **Backend** | Node.js, Express, ES Modules | Unified JavaScript stack, RESTful API endpoints |
| **Database** | LibSQL / SQLite (`@libsql/client`) | Serverless-compatible file & cloud database (Turso ready) |
| **AI Orchestrator** | Google Gemini API (`gemini-2.0-flash` via `@google/generative-ai`) | Fast, structured JSON generation with fallback heuristic engine |
| **Authentication** | JWT (JSON Web Tokens), bcryptjs | Secure user sessions and project isolation |
| **Testing** | Vitest, Supertest, Playwright | Unit, API integration, and E2E automation |

---

## ⚙️ Setup & Local Development Instructions

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd Piyush_Dev_AGGROSO
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env` and provide your Google Gemini API key:
```bash
cp .env.example .env
```
Fill in your configuration:
```env
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=file:local.db
JWT_SECRET=super-secret-development-jwt-key
PORT=3001
NODE_ENV=development
```

### 3. Run Development Servers
Start both the Express backend API and Vite frontend dev server concurrently:
```bash
npm run dev
```
- Frontend will open at: `http://localhost:5173`
- Backend API runs at: `http://localhost:3001`

---

## 🧪 Testing Strategy & Execution

### Run Unit & Integration Tests (Vitest + Supertest)
```bash
npm test
```
Tests cover:
- Deterministic acceptance criteria coverage math & edge cases.
- Jaccard text similarity duplicate detection.
- Incomplete test case validation.
- Knowledge base retrieval scoring.
- Authentication & Project CRUD API integration routes.

### Run End-to-End Tests (Playwright)
```bash
npm run test:e2e
```

---

## 📊 Deployment to Vercel

1. Push code to GitHub repository.
2. Import project into Vercel Dashboard.
3. Set Environment Variable: `GEMINI_API_KEY` = your API key.
4. Deploy! Vercel automatically uses `vercel.json` to handle Vite static assets and Express serverless function routes (`api/index.js`).

---

## 📌 Intentionally Excluded Scope & Known Limitations

1. **Test Execution**: The application **proposes and plans** test cases. It does not execute tests or report feature release readiness.
2. **WebSocket Signaling**: Used short-polling (8s interval) for real-time collaboration updates instead of WebSockets to maintain serverless environment compatibility on Vercel.
3. **Vector Database**: Used TF-IDF keyword frequency scoring on local markdown guidelines rather than Pinecone/Chroma to minimize third-party service dependencies.
