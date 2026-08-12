import { getDb } from '../db/connection.js';

const timestamp = () => new Date().toISOString();

export async function info(message, context = null) {
  console.log(`[INFO] ${timestamp()} ${message}`, context || '');
  try {
    const db = getDb();
    await db.execute({
      sql: 'INSERT INTO app_logs (level, message, context) VALUES (?, ?, ?)',
      args: ['info', message, context ? JSON.stringify(context) : null],
    });
  } catch (e) { /* don't fail on log errors */ }
}

export async function warn(message, context = null) {
  console.warn(`[WARN] ${timestamp()} ${message}`, context || '');
  try {
    const db = getDb();
    await db.execute({
      sql: 'INSERT INTO app_logs (level, message, context) VALUES (?, ?, ?)',
      args: ['warn', message, context ? JSON.stringify(context) : null],
    });
  } catch (e) { /* don't fail on log errors */ }
}

export async function error(message, context = null) {
  console.error(`[ERROR] ${timestamp()} ${message}`, context || '');
  try {
    const db = getDb();
    await db.execute({
      sql: 'INSERT INTO app_logs (level, message, context) VALUES (?, ?, ?)',
      args: ['error', message, context ? JSON.stringify(context) : null],
    });
  } catch (e) { /* don't fail on log errors */ }
}

export async function logAiStep(planId, step, inputData, outputData, model, tokensUsed, durationMs) {
  console.log(`[AI] ${timestamp()} step=${step} model=${model} tokens=${tokensUsed} duration=${durationMs}ms`);
  try {
    const db = getDb();
    await db.execute({
      sql: `INSERT INTO ai_logs (plan_id, step, input_data, output_data, model, tokens_used, duration_ms)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        planId,
        step,
        typeof inputData === 'string' ? inputData : JSON.stringify(inputData),
        typeof outputData === 'string' ? outputData : JSON.stringify(outputData),
        model,
        tokensUsed || 0,
        durationMs || 0,
      ],
    });
  } catch (e) {
    console.error('[Logger] Failed to log AI step:', e.message);
  }
}

export async function getLogs({ level, limit = 50, offset = 0, planId, type = 'app' } = {}) {
  const db = getDb();
  if (type === 'ai') {
    let sql = 'SELECT * FROM ai_logs';
    const args = [];
    const conditions = [];
    if (planId) { conditions.push('plan_id = ?'); args.push(planId); }
    if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    args.push(limit, offset);
    const result = await db.execute({ sql, args });
    const countSql = planId
      ? 'SELECT COUNT(*) as total FROM ai_logs WHERE plan_id = ?'
      : 'SELECT COUNT(*) as total FROM ai_logs';
    const countResult = await db.execute({ sql: countSql, args: planId ? [planId] : [] });
    return { logs: result.rows, total: Number(countResult.rows[0]?.total || 0) };
  }
  let sql = 'SELECT * FROM app_logs';
  const args = [];
  const conditions = [];
  if (level) { conditions.push('level = ?'); args.push(level); }
  if (conditions.length) sql += ' WHERE ' + conditions.join(' AND ');
  sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  args.push(limit, offset);
  const result = await db.execute({ sql, args });
  const countSql = level
    ? 'SELECT COUNT(*) as total FROM app_logs WHERE level = ?'
    : 'SELECT COUNT(*) as total FROM app_logs';
  const countResult = await db.execute({ sql: countSql, args: level ? [level] : [] });
  return { logs: result.rows, total: Number(countResult.rows[0]?.total || 0) };
}

export default { info, warn, error, logAiStep, getLogs };
