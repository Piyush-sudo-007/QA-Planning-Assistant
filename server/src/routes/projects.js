import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all project routes
router.use(authenticate);

// POST /api/projects - Create project
router.post('/', async (req, res, next) => {
  try {
    const { name, requirement, acceptanceCriteria, implementationSummary } = req.body;

    if (!name || !requirement || !acceptanceCriteria || !implementationSummary) {
      return res.status(400).json({ error: 'All fields (name, requirement, acceptanceCriteria, implementationSummary) are required.' });
    }

    const acArray = Array.isArray(acceptanceCriteria)
      ? acceptanceCriteria
      : [acceptanceCriteria];

    if (acArray.length === 0) {
      return res.status(400).json({ error: 'At least one acceptance criterion is required.' });
    }

    const projectId = uuidv4();
    const db = getDb();

    await db.execute({
      sql: `INSERT INTO projects (id, user_id, name, requirement, acceptance_criteria, implementation_summary)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        projectId,
        req.user.id,
        name.trim(),
        requirement.trim(),
        JSON.stringify(acArray),
        implementationSummary.trim(),
      ],
    });

    const created = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ?',
      args: [projectId],
    });

    const project = created.rows[0];
    project.acceptance_criteria = JSON.parse(project.acceptance_criteria);

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects - List user's projects with latest plan status
router.get('/', async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: `SELECT p.*, 
            (SELECT MAX(version) FROM qa_plans WHERE project_id = p.id) as latest_version,
            (SELECT coverage_score FROM qa_plans WHERE project_id = p.id ORDER BY version DESC LIMIT 1) as latest_coverage,
            (SELECT status FROM qa_plans WHERE project_id = p.id ORDER BY version DESC LIMIT 1) as latest_status,
            (SELECT id FROM qa_plans WHERE project_id = p.id ORDER BY version DESC LIMIT 1) as latest_plan_id
            FROM projects p
            WHERE p.user_id = ?
            ORDER BY p.updated_at DESC`,
      args: [req.user.id],
    });

    const projects = result.rows.map((row) => ({
      ...row,
      acceptance_criteria: JSON.parse(row.acceptance_criteria || '[]'),
    }));

    res.json({ projects });
  } catch (err) {
    next(err);
  }
});

// GET /api/projects/:id - Get project details with all plans
router.get('/:id', async (req, res, next) => {
  try {
    const db = getDb();
    const projectResult = await db.execute({
      sql: 'SELECT * FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    });

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    const project = projectResult.rows[0];
    project.acceptance_criteria = JSON.parse(project.acceptance_criteria || '[]');

    const plansResult = await db.execute({
      sql: 'SELECT * FROM qa_plans WHERE project_id = ? ORDER BY version DESC',
      args: [project.id],
    });

    res.json({ project, plans: plansResult.rows });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/projects/:id - Delete project and related data
router.delete('/:id', async (req, res, next) => {
  try {
    const db = getDb();

    // Verify ownership
    const check = await db.execute({
      sql: 'SELECT id FROM projects WHERE id = ? AND user_id = ?',
      args: [req.params.id, req.user.id],
    });

    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found.' });
    }

    // Delete project, plans, test cases
    const plans = await db.execute({
      sql: 'SELECT id FROM qa_plans WHERE project_id = ?',
      args: [req.params.id],
    });

    for (const plan of plans.rows) {
      await db.execute({ sql: 'DELETE FROM test_cases WHERE plan_id = ?', args: [plan.id] });
    }
    await db.execute({ sql: 'DELETE FROM qa_plans WHERE project_id = ?', args: [req.params.id] });
    await db.execute({ sql: 'DELETE FROM projects WHERE id = ?', args: [req.params.id] });

    res.json({ success: true, message: 'Project deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

export default router;
