import { GoogleGenerativeAI } from '@google/generative-ai';
import config from '../config.js';
import knowledgeBase from './knowledge-base.js';
import coverageService from './coverage.js';
import logger from './logger.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Clean JSON output from Gemini (remove markdown code blocks ```json ... ```)
 */
function cleanJsonOutput(text) {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return cleaned;
}

/**
 * Fallback AI Plan Generator when Gemini API key is unavailable or encounters an error
 */
function generateFallbackPlan(project, retrievedDocs) {
  const acList = Array.isArray(project.acceptanceCriteria)
    ? project.acceptanceCriteria
    : JSON.parse(project.acceptanceCriteria || '[]');

  const titlePrefix = project.name || 'Feature';

  const flows = [
    {
      name: `Primary User Journey for ${titlePrefix}`,
      description: `Complete end-to-end execution of ${project.requirement.slice(0, 100)}...`,
      steps: [
        'User navigates to the application interface',
        'User initiates action specified in requirement',
        'System validates input parameters and processes transaction',
        'User receives confirmation response and visual feedback',
      ],
    },
    {
      name: `Validation & Failure Flow for ${titlePrefix}`,
      description: 'Handling invalid input parameters and unexpected failure states',
      steps: [
        'User submits form with missing or invalid fields',
        'System intercepts request and returns inline validation errors',
        'User corrects inputs and resubmits',
      ],
    },
  ];

  const testCases = [];

  // Generate unit tests
  testCases.push({
    id: uuidv4(),
    type: 'unit',
    title: `Unit Test: Input validation for ${titlePrefix}`,
    description: `Verify that input parameters for ${titlePrefix} are properly validated before processing.`,
    steps: ['Arrange invalid input object', 'Act: call validation handler', 'Assert: expect validation error response'],
    expectedResult: 'Validation handler throws or returns expected validation errors.',
    relevance: 'Ensures business rules and boundary constraints are enforced in isolated functions before execution.',
    category: 'edge_case',
    priority: 'high',
    status: 'proposed',
    mapped_criteria: JSON.stringify([0]),
    is_duplicate: 0,
    is_incomplete: 0,
  });

  // Generate API tests
  testCases.push({
    id: uuidv4(),
    type: 'api',
    title: `API Test: POST endpoint contract verification`,
    description: `Send valid POST payload to create/update resource for ${titlePrefix} and assert 200/201 status code.`,
    steps: ['Send POST request with valid body header JWT', 'Assert status 200 OK', 'Validate returned JSON schema'],
    expectedResult: 'API returns HTTP 200/201 with correctly structured JSON payload.',
    relevance: 'Verifies server endpoint contract, HTTP status codes, and database persistence.',
    category: 'happy_path',
    priority: 'critical',
    status: 'proposed',
    mapped_criteria: JSON.stringify([0, 1].filter((i) => i < acList.length)),
    is_duplicate: 0,
    is_incomplete: 0,
  });

  // Generate Playwright test
  testCases.push({
    id: uuidv4(),
    type: 'playwright',
    title: `Playwright E2E: User interaction flow for ${titlePrefix}`,
    description: `Automated Playwright test simulating user completing the main workflow on UI.`,
    steps: [
      `await page.goto('/')`,
      `await page.getByRole('button', { name: 'Submit' }).click()`,
      `await expect(page.getByText('Success')).toBeVisible()`,
    ],
    expectedResult: 'Playwright test completes cleanly without locator or assertion timeouts.',
    relevance: 'Automates user interface regression testing across real browsers.',
    category: 'happy_path',
    priority: 'high',
    status: 'proposed',
    mapped_criteria: JSON.stringify([0, acList.length - 1].filter((i) => i < acList.length)),
    is_duplicate: 0,
    is_incomplete: 0,
  });

  // Generate Edge case test
  testCases.push({
    id: uuidv4(),
    type: 'integration',
    title: `Integration Test: Concurrent request handling and DB rollback`,
    description: `Simulate high concurrency requests for ${titlePrefix} to ensure transaction safety and no data corruption.`,
    steps: ['Trigger parallel requests with conflicting IDs', 'Assert DB locks or optimistic concurrency exceptions'],
    expectedResult: 'Database maintains consistency with no orphaned records.',
    relevance: 'Prevents race conditions, double submissions, and database state corruption.',
    category: 'failure_state',
    priority: 'medium',
    status: 'proposed',
    mapped_criteria: JSON.stringify([acList.length > 1 ? 1 : 0]),
    is_duplicate: 0,
    is_incomplete: 0,
  });

  // Generate Manual test
  testCases.push({
    id: uuidv4(),
    type: 'manual',
    title: `Manual QA: Exploratory visual & accessibility verification`,
    description: `Manually test visual rendering, keyboard tab navigation, and dark mode contrast for ${titlePrefix}.`,
    steps: [
      'Open application on desktop browser and switch to dark mode',
      'Navigate through form elements using Tab key exclusively',
      'Submit form using Enter key and observe visual notification position',
    ],
    expectedResult: 'All interactive elements have visual focus rings and visual components render cleanly.',
    relevance: 'Uncovers UX glitches, visual misalignment, and keyboard accessibility issues.',
    category: 'permission',
    priority: 'medium',
    status: 'proposed',
    mapped_criteria: JSON.stringify(acList.map((_, i) => i)),
    is_duplicate: 0,
    is_incomplete: 0,
  });

  const assumptions = [
    {
      assumption: 'User authentication session token is stored in LocalStorage or HTTP-only cookies.',
      reason: 'The requirement document does not specify session storage implementation details.',
    },
    {
      assumption: 'Database operations use ACID-compliant transactions with auto-rollback.',
      reason: 'Implementation summary mentions ORM but omits transaction scope details.',
    },
  ];

  const regressionAreas = [
    {
      area: 'User Authentication & Authorization middleware',
      risk: 'High',
      mitigation: 'Run full auth regression test suite prior to deployment.',
    },
    {
      area: 'Database indices and unique constraint enforcement',
      risk: 'Medium',
      mitigation: 'Verify database migration scripts on staging environment.',
    },
  ];

  return {
    flows,
    testCases,
    assumptions,
    regressionAreas,
    retrievedGuidelines: retrievedDocs.map((d) => d.title),
    aiReasoning: 'Generated complete multi-tier QA test suite adhering to established QA knowledge guidelines (Unit, API, Integration, Playwright E2E, and Manual).',
  };
}

/**
 * Main AI Workflow Orchestrator Function
 */
export async function generateQAPlan(project, planId) {
  const startTime = Date.now();
  const acList = Array.isArray(project.acceptanceCriteria)
    ? project.acceptanceCriteria
    : JSON.parse(project.acceptanceCriteria || '[]');

  // Step 1: Knowledge Retrieval
  logger.info(`[AI Agent] Step 1: Retrieving QA guidelines for project '${project.name}'`);
  const retrievedDocs = knowledgeBase.retrieveRelevant(project.requirement, project.implementationSummary, 4);
  await logger.logAiStep(
    planId,
    'knowledge_retrieval',
    { requirement: project.requirement, implementationSummary: project.implementationSummary },
    { retrievedDocs: retrievedDocs.map((d) => ({ id: d.id, title: d.title, score: d.score })) },
    'knowledge-base-retriever',
    0,
    Date.now() - startTime
  );

  // Step 2: AI Generation with Gemini API (or fallback if API key missing)
  let rawAiResult = null;
  const geminiStartTime = Date.now();

  if (config.geminiApiKey && config.geminiApiKey !== 'your_gemini_api_key_here') {
    try {
      logger.info(`[AI Agent] Step 2: Querying Gemini API (${config.geminiModel})`);
      const genAI = new GoogleGenerativeAI(config.geminiApiKey);
      const model = genAI.getGenerativeModel({ model: config.geminiModel });

      const kbContext = retrievedDocs.map((d) => `### ${d.title}\n${d.content}`).join('\n\n');

      const systemPrompt = `You are a Senior QA Automation Architect and Test Planning Expert.
Your task is to analyze a developer's feature request and produce a comprehensive, professional QA Plan in JSON format.

RULES:
1. Propose thorough test cases across multiple types: 'unit', 'api', 'integration', 'e2e', 'playwright', 'manual'.
2. Categorize each test case: 'happy_path', 'edge_case', 'permission', 'failure_state', 'regression'.
3. Explain WHY each test is relevant in the 'relevance' field.
4. Map each test to acceptance criteria 0-based indices array in 'mappedCriteria'.
5. Clearly identify assumptions in 'assumptions' array when requirement context is incomplete.
6. Identify likely regression areas and risk mitigations.
7. Return ONLY raw valid JSON adhering strictly to the JSON schema below. Do not wrap in markdown or add conversational text.

JSON SCHEMA EXPECTED:
{
  "flows": [
    { "name": "string", "description": "string", "steps": ["string"] }
  ],
  "testCases": [
    {
      "type": "unit|api|integration|e2e|playwright|manual",
      "title": "string",
      "description": "string",
      "steps": ["string"],
      "expectedResult": "string",
      "relevance": "string",
      "category": "happy_path|edge_case|permission|failure_state|regression",
      "priority": "critical|high|medium|low",
      "mappedCriteria": [0]
    }
  ],
  "assumptions": [
    { "assumption": "string", "reason": "string" }
  ],
  "regressionAreas": [
    { "area": "string", "risk": "string", "mitigation": "string" }
  ],
  "aiReasoning": "string summary of decisions"
}`;

      const userPrompt = `
PROJECT TITLE: ${project.name}

REQUIREMENT / USER STORY:
${project.requirement}

ACCEPTANCE CRITERIA:
${acList.map((ac, idx) => `[${idx}] ${ac}`).join('\n')}

IMPLEMENTATION SUMMARY:
${project.implementationSummary}

QA STANDARDS & GUIDELINES (RETRIEVED FROM KNOWLEDGE BASE):
${kbContext}
`;

      const response = await model.generateContent({
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const responseText = response.response.text();
      const cleanedJson = cleanJsonOutput(responseText);
      const parsedData = JSON.parse(cleanedJson);

      // Process test cases and assign IDs
      const testCases = (parsedData.testCases || []).map((tc) => ({
        id: uuidv4(),
        type: tc.type || 'manual',
        title: tc.title || 'Untitled Test Case',
        description: tc.description || '',
        steps: Array.isArray(tc.steps) ? tc.steps : [],
        expected_result: tc.expectedResult || tc.expected_result || '',
        relevance: tc.relevance || 'Verifies requirement compliance.',
        category: tc.category || 'happy_path',
        priority: tc.priority || 'medium',
        status: 'proposed',
        mapped_criteria: JSON.stringify(tc.mappedCriteria || tc.mapped_criteria || [0]),
        is_duplicate: 0,
        is_incomplete: 0,
      }));

      rawAiResult = {
        flows: parsedData.flows || [],
        testCases,
        assumptions: parsedData.assumptions || [],
        regressionAreas: parsedData.regressionAreas || [],
        retrievedGuidelines: retrievedDocs.map((d) => d.title),
        aiReasoning: parsedData.aiReasoning || 'Generated QA plan using Gemini API analysis.',
      };

      await logger.logAiStep(
        planId,
        'ai_generation',
        { promptLength: userPrompt.length },
        { testCaseCount: testCases.length, flowsCount: rawAiResult.flows.length },
        config.geminiModel,
        response.response.usageMetadata?.totalTokenCount || 0,
        Date.now() - geminiStartTime
      );
    } catch (err) {
      logger.warn(`[AI Agent] Gemini API call failed or unavailable (${err.message}). Falling back to local heuristic QA generator.`);
      rawAiResult = generateFallbackPlan(project, retrievedDocs);
    }
  } else {
    logger.info('[AI Agent] No Gemini API key provided. Using built-in QA heuristic engine.');
    rawAiResult = generateFallbackPlan(project, retrievedDocs);
  }

  // Step 3: Quality Analysis (Deterministic)
  logger.info('[AI Agent] Step 3: Executing quality analysis & coverage calculation');
  const qualityAnalysis = coverageService.analyzeQuality(acList, rawAiResult.testCases);

  // Update test cases with duplicate / incomplete flags
  rawAiResult.testCases = qualityAnalysis.annotatedTestCases;

  await logger.logAiStep(
    planId,
    'quality_analysis',
    { testCasesCount: rawAiResult.testCases.length },
    {
      coverageScore: qualityAnalysis.coverage.score,
      duplicatesCount: qualityAnalysis.duplicates.length,
      incompleteCount: qualityAnalysis.incomplete.length,
    },
    'deterministic-coverage-engine',
    0,
    Date.now() - startTime
  );

  return {
    ...rawAiResult,
    coverage: qualityAnalysis.coverage,
    qualityAnalysis,
  };
}

export default { generateQAPlan };
