# Agent Usage Report (`AGENT_USAGE.md`)

This document records the artificial intelligence agent tools, prompts, delegated work, error handling, and human verification strategies utilized during the development of the **Agentic QA Planning Assistant**.

---

## 🛠️ Tools & Capabilities Utilized

- **AI Code Assistant**: Antigravity Pair-Programming Agent (Google DeepMind).
- **LLM Engine**: Google Gemini API (`gemini-2.0-flash` / `@google/generative-ai`) for application feature generation.
- **FS & Workspace Tools**: `write_to_file`, `replace_file_content`, `view_file`, `list_dir`, `run_command`.
- **Subagent Systems**: `invoke_subagent` and `manage_subagents` for tech stack research and parallel module synthesis.

---

## 📝 Representative Prompts

### 1. System Prompt for AI Test Case Generation
```text
You are a Senior QA Automation Architect and Test Planning Expert.
Your task is to analyze a developer's feature request and produce a comprehensive, professional QA Plan in JSON format.

RULES:
1. Propose thorough test cases across multiple types: 'unit', 'api', 'integration', 'e2e', 'playwright', 'manual'.
2. Categorize each test case: 'happy_path', 'edge_case', 'permission', 'failure_state', 'regression'.
3. Explain WHY each test is relevant in the 'relevance' field.
4. Map each test to acceptance criteria 0-based indices array in 'mappedCriteria'.
5. Clearly identify assumptions in 'assumptions' array when requirement context is incomplete.
6. Identify likely regression areas and risk mitigations.
7. Return ONLY raw valid JSON adhering strictly to the JSON schema below.
```

### 2. Prompt for Researching Deployment and Knowledge Base Architecture
```text
Research best practices for building an AI-powered QA planning assistant application:
1. Google Gemini API structured output generation schemas.
2. Serverless Express deployment on Vercel with single package.json.
3. TF-IDF keyword frequency scoring for local knowledge base retrieval.
```

---

## 🤖 Work Delegated to Subagents

1. **Tech Stack Researcher**: Delegated initial exploration of `@google/generative-ai` package and SQLite connection handling.
2. **Backend & Frontend Synthesis**: Delegated multi-file creation tasks to subagent workers to accelerate parallel execution.

---

## ⚠️ Important Agent Errors & Handled Rejected Suggestions

### 1. Model API Overload & Quota Limits (Resource Exhausted 429)
- **Issue**: During parallel subagent invocation, subagents encountered rate-limit quota errors (`RESOURCE_EXHAUSTED 429`).
- **Resolution**: Gracefully killed background subagents using `manage_subagents(Action: 'kill_all')` and directly orchestrated file creation using primary agent file writing tools.

### 2. Hallucinated Coverage Scores
- **Rejected Suggestion**: Initial prompt draft asked the LLM to calculate its own acceptance criteria coverage percentage.
- **Reason for Rejection**: LLMs are prone to hallucinating math percentages.
- **Correction**: Replaced LLM coverage calculation with a **100% deterministic JavaScript algorithm** (`coverageService.calculateCoverage`) that checks mapped acceptance criteria indices against approved test case statuses.

---

## 🔍 How Generated Output Was Verified

1. **Automated Unit & Integration Testing**:
   - Executed `npm test` via Vitest and Supertest to verify coverage calculation, Jaccard duplicate detection, knowledge retrieval, and authentication routes.
   - **Result**: 9/9 tests passed cleanly.

2. **Frontend Production Compilation**:
   - Executed `npm run build` to verify Vite bundle compilation and CSS module resolution.
   - **Result**: Transformed 1618 modules into optimized production bundles in 5.68 seconds without build warnings.

3. **Manual Flow Verification**:
   - Verified that the heuristic fallback QA engine operates smoothly when `GEMINI_API_KEY` is missing or experiencing transient API timeouts.
