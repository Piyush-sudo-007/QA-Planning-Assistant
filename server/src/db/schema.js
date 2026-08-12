import { getDb } from './connection.js';

const TABLES = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    requirement TEXT NOT NULL,
    acceptance_criteria TEXT NOT NULL,
    implementation_summary TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS qa_plans (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    version INTEGER NOT NULL,
    status TEXT DEFAULT 'draft',
    coverage_score REAL DEFAULT 0,
    ai_reasoning TEXT,
    retrieved_guidelines TEXT,
    identified_flows TEXT,
    assumptions TEXT,
    regression_areas TEXT,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(project_id, version)
  )`,
  `CREATE TABLE IF NOT EXISTS test_cases (
    id TEXT PRIMARY KEY,
    plan_id TEXT NOT NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps TEXT,
    expected_result TEXT,
    relevance TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium',
    status TEXT DEFAULT 'proposed',
    mapped_criteria TEXT NOT NULL,
    is_duplicate INTEGER DEFAULT 0,
    is_incomplete INTEGER DEFAULT 0,
    developer_notes TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    plan_id TEXT,
    step TEXT NOT NULL,
    input_data TEXT,
    output_data TEXT,
    model TEXT,
    tokens_used INTEGER,
    duration_ms INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
  `CREATE TABLE IF NOT EXISTS app_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    context TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  )`,
];

export async function initializeDatabase() {
  const db = getDb();
  for (const sql of TABLES) {
    await db.execute(sql);
  }
  console.log('[DB] Schema initialized — all tables ready');
}

export default initializeDatabase;
