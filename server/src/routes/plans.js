import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';
import aiAgent from '../services/ai-agent.js';
import coverageService from '../services/coverage.js';
import logger from '../services/logger.js';

const router = express.Router();

router.use(authenticate);

// Helper to format plan database row
function formatPlan(planRow, testCasesRows = []) {
  return {
    ...planRow,
    retrieved_guidelines: typeof planRow.retrieved_guidelines === 'string'
      ? JSON.parse(planRow.retrieved_guidelines || '[]') : planRow.retrieved_guidelines,
    identified_flows: typeof planRow.identified_flows === 'string'
      ? JSON.parse(planRow.identified_flows || '[]') : planRow.identified_flows,
    assumptions: typeof planRow.assumptions === 'string'
      ? JSON.parse(planRow.assumptions || '[]') : planRow.assumptions,
    regression_areas: typeof planRow.regression_areas === 'string'
      ? JSON.parse(planRow.regression_areas || '[]') : planRow.regression_areas,
    testCases: testCasesRows.map((tc) => ({
      ...tc,
      steps: typeof tc.steps === 'string' ? JSON.parse(tc.steps || '[]') : tc.steps,
      mapped_criteria: typeof tc.mapped_criteria === 'string' ? JSON.parse(tc.mapped_criteria || '[]') : tc.mapped_criteria,
    })),
  };
}

// POST /api/projects/:projectId/generate - Generate QA Plan
router.post('/projects/:projectId/generate', async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const db = getDb();

    // Fetch project
    const projectRes = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      args: [projectId, req.user.id],
    });

    if (projectRes.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projectRes.rows[0];
    project.acceptanceCriteria = JSON.parse(project.acceptance_criteria || '[]');

    // Get current max version
    const versionRes = await db.execute({
      sql: 'SELECT MAX(version) as max_v FROM qa_plans WHERE project_id = ?',
      args: [projectId],
    });
    const nextVersion = (versionRes.rows[0]?.max_v || 0) + 1;

    const planId = uuidv4();

    // Execute AI Workflow
    const aiResult = await aiAgent.generateQAPlan(project, planId);

    // Save QA Plan to DB
    await db.execute({
      sql: `INSERT INTO qa_plans (id, project_id, version, status, coverage_score, ai_reasoning, 
            retrieved_guidelines, identified_flows, assumptions, regression_areas, created_by)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        planId,
        projectId,
        nextVersion,
        'draft',
        aiResult.coverage.score,
        aiResult.aiReasoning,
        JSON.stringify(aiResult.retrievedGuidelines),
        JSON.stringify(aiResult.flows),
        JSON.stringify(aiResult.assumptions),
        JSON.stringify(aiResult.regressionAreas),
        req.user.name,
      ],
    });

    // Save Test Cases to DB
    for (const tc of aiResult.testCases) {
      await db.execute({
        sql: `INSERT INTO test_cases (id, plan_id, type, title, description, steps, expected_result, 
              relevance, category, priority, status, mapped_criteria, is_duplicate, is_incomplete)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          tc.id,
          planId,
          tc.type,
          tc.title,
          tc.description,
          JSON.stringify(tc.steps || []),
          tc.expected_result || tc.expectedResult || '',
          tc.relevance,
          tc.category,
          tc.priority,
          tc.status || 'proposed',
          typeof tc.mapped_criteria === 'string' ? tc.mapped_criteria : JSON.stringify(tc.mapped_criteria || tc.mappedCriteria || []),
          tc.is_duplicate || 0,
          tc.is_incomplete || 0,
        ],
      });
    }

    // Fetch newly created plan and tests
    const planRow = (await db.execute({ sql: 'SELECT * FROM qa_plans WHERE id = ?', args: [planId] })).rows[0];
    const testRows = (await db.execute({ sql: 'SELECT * FROM test_cases WHERE plan_id = ?', args: [planId] })).rows;

    const fullPlan = formatPlan(planRow, testRows);

    res.status(201).json({
      plan: fullPlan,
      coverage: aiResult.coverage,
      qualityAnalysis: aiResult.qualityAnalysis,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/:id - Get QA plan with test cases
router.get('/plans/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const planRes = await db.execute({
      sql: `SELECT p.*, proj.name as project_name, proj.requirement, proj.acceptance_criteria, proj.implementation_summary
            FROM qa_plans p
            JOIN projects proj ON p.project_id = proj.id
            WHERE p.id = ?`,
      args: [req.params.id],
    });

    if (planRes.rows.length === 0) {
      return res.status(404).json({ error: 'QA Plan not found.' });
    }

    const planRow = planRes.rows[0];
    const acceptanceCriteria = JSON.parse(planRow.acceptance_criteria || '[]');

    const testRows = (await db.execute({
      sql: 'SELECT * FROM test_cases WHERE plan_id = ? ORDER BY created_at ASC',
      args: [req.params.id],
    })).rows;

    const fullPlan = formatPlan(planRow, testRows);
    fullPlan.project_acceptance_criteria = acceptanceCriteria;

    // Recalculate live coverage
    const quality = coverageService.analyzeQuality(acceptanceCriteria, fullPlan.testCases);

    res.json({
      plan: fullPlan,
      coverage: quality.coverage,
      qualityAnalysis: quality,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:projectId/plans - List versions
router.get('/projects/:projectId/plans', async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT id, version, status, coverage_score, created_by, created_at, updated_at FROM qa_plans WHERE project_id = ? ORDER BY version DESC',
      args: [req.params.projectId],
    });

    res.json({ plans: result.rows });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/plans/:planId/tests/:testId - Human Review/Edit Test Case
router.patch('/plans/:planId/tests/:testId', async (req, res, next) => {
  try {
    const { planId, testId } = req.params;
    const { status, priority, title, description, developerNotes, steps, expectedResult, category } = req.body;

    const db = getDb();

    // Check test exists
    const testCheck = await db.execute({
      sql: 'SELECT * FROM test_cases WHERE id = ? AND plan_id = ?',
      args: [testId, planId],
    });

    if (testCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Test case not found.' });
    }

    const current = testCheck.rows[0];
    const newStatus = status || current.status;
    const newPriority = priority || current.priority;
    const newTitle = title !== undefined ? title : current.title;
    const newDesc = description !== undefined ? description : current.description;
    const newNotes = developerNotes !== undefined ? developerNotes : current.developer_notes;
    const newSteps = steps !== undefined ? JSON.stringify(steps) : current.steps;
    const newExp = expectedResult !== undefined ? expectedResult : current.expected_result;
    const newCategory = category !== undefined ? category : current.category;

    await db.execute({
      sql: `UPDATE test_cases 
            SET status = ?, priority = ?, title = ?, description = ?, developer_notes = ?, steps = ?, expected_result = ?, category = ?, updated_at = datetime('now')
            WHERE id = ? AND plan_id = ?`,
      args: [newStatus, newPriority, newTitle, newDesc, newNotes, newSteps, newExp, newCategory, testId, planId],
    });

    // Touch plan updated_at for real-time collaboration
    await db.execute({
      sql: "UPDATE qa_plans SET updated_at = datetime('now') WHERE id = ?",
      args: [planId],
    });

    // Re-fetch updated test case
    const updatedTest = (await db.execute({ sql: 'SELECT * FROM test_cases WHERE id = ?', args: [testId] })).rows[0];
    updatedTest.steps = JSON.parse(updatedTest.steps || '[]');
    updatedTest.mapped_criteria = JSON.parse(updatedTest.mapped_criteria || '[]');

    // Re-calculate coverage score
    const planProj = (await db.execute({
      sql: 'SELECT proj.acceptance_criteria FROM qa_plans p JOIN projects proj ON p.project_id = proj.id WHERE p.id = ?',
      args: [planId],
    })).rows[0];

    const acceptanceCriteria = JSON.parse(planProj?.acceptance_criteria || '[]');
    const allTests = (await db.execute({ sql: 'SELECT * FROM test_cases WHERE plan_id = ?', args: [planId] })).rows;

    const coverage = coverageService.calculateCoverage(acceptanceCriteria, allTests);

    // Update plan coverage score in DB
    await db.execute({
      sql: 'UPDATE qa_plans SET coverage_score = ? WHERE id = ?',
      args: [coverage.score, planId],
    });

    logger.info(`[Human Review] Test ${testId} status updated to '${newStatus}' by ${req.user.name}`);

    res.json({ testCase: updatedTest, coverage });
  } catch (err) {
    next(err);
  }
});

// POST /api/plans/:id/save - Save reviewed QA plan
router.post('/plans/:id/save', async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDb();

    await db.execute({
      sql: "UPDATE qa_plans SET status = 'reviewed', updated_at = datetime('now') WHERE id = ?",
      args: [id],
    });

    const updatedPlan = (await db.execute({ sql: 'SELECT * FROM qa_plans WHERE id = ?', args: [id] })).rows[0];
    res.json({ plan: updatedPlan, message: 'QA plan saved and marked as reviewed.' });
  } catch (err) {
    next(err);
  }
});

// GET /api/plans/:id/updates - Real-time collaboration polling endpoint
router.get('/plans/:id/updates', async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT updated_at, status, coverage_score FROM qa_plans WHERE id = ?',
      args: [req.params.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    res.json({
      lastModified: result.rows[0].updated_at,
      status: result.rows[0].status,
      coverageScore: result.rows[0].coverage_score,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/logs - Application and AI logs endpoint
router.get('/logs', async (req, res, next) => {
  try {
    const { level, limit = 50, offset = 0, planId, type = 'app' } = req.query;
    const logsResult = await logger.getLogs({
      level,
      limit: parseInt(limit, 10),
      offset: parseInt(offset, 10),
      planId,
      type,
    });
    res.json(logsResult);
  } catch (err) {
    next(err);
  }
});

export default router;
