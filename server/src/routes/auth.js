import express from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../db/connection.js';
import { generateToken, authenticate } from '../middleware/auth.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { email, name, password } = body;

    if (!email || !name || !password) {
      return res.status(400).json({
        error: 'Email, name, and password are all required. Please ensure password is at least 6 characters.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const db = getDb();
    const existing = await db.execute({
      sql: 'SELECT id FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });

    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'User with this email already exists.' });
    }

    const userId = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    await db.execute({
      sql: 'INSERT INTO users (id, email, name, password_hash) VALUES (?, ?, ?, ?)',
      args: [userId, email.toLowerCase().trim(), name.trim(), passwordHash],
    });

    const user = { id: userId, email: email.toLowerCase().trim(), name: name.trim() };
    const token = generateToken(user);

    res.status(201).json({ token, user });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    let body = req.body || {};
    if (typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { body = {}; }
    }

    const { email, password } = body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT * FROM users WHERE email = ?',
      args: [email.toLowerCase().trim()],
    });

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const userRow = result.rows[0];
    const match = await bcrypt.compare(password, userRow.password_hash);

    if (!match) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = { id: userRow.id, email: userRow.email, name: userRow.name };
    const token = generateToken(user);

    res.json({ token, user });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const db = getDb();
    const result = await db.execute({
      sql: 'SELECT id, email, name, created_at FROM users WHERE id = ?',
      args: [req.user.id],
    });

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
