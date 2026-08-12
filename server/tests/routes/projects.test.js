import { describe, it, expect, beforeAll } from 'vitest';
import supertest from 'supertest';
import app from '../../src/app.js';
import { initializeDatabase } from '../../src/db/schema.js';

const request = supertest(app);

describe('Backend API Integration Routes', () => {
  let token = '';

  beforeAll(async () => {
    await initializeDatabase();

    // Register a test user
    const authRes = await request.post('/api/auth/register').send({
      email: `test-${Date.now()}@example.com`,
      name: 'Test Engineer',
      password: 'password123',
    });

    token = authRes.body.token;
  });

  it('GET /api/health should return ok', async () => {
    const res = await request.get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('POST /api/projects should create a new QA project', async () => {
    const res = await request
      .post('/api/projects')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'API Auth Feature',
        requirement: 'Implement OAuth2 authorization code flow with PKCE',
        acceptanceCriteria: ['Must issue access token', 'Must reject invalid PKCE code verifier'],
        implementationSummary: 'Express middleware updated with PKCE verifier hashing',
      });

    expect(res.status).toBe(201);
    expect(res.body.project).toBeDefined();
    expect(res.body.project.id).toBeDefined();
  });

  it('GET /api/projects should list projects for authenticated user', async () => {
    const res = await request.get('/api/projects').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.projects)).toBe(true);
    expect(res.body.projects.length).toBeGreaterThan(0);
  });
});
