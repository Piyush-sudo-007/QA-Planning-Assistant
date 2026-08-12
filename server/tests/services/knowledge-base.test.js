import { describe, it, expect } from 'vitest';
import knowledgeBase from '../../src/services/knowledge-base.js';

describe('Knowledge Base Service', () => {
  it('should retrieve relevant QA guidelines based on query keywords', () => {
    const docs = knowledgeBase.retrieveRelevant('Playwright UI testing', 'E2E browser automation', 2);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs[0].title).toBeDefined();
    expect(docs[0].content).toBeDefined();
  });

  it('should return all documents from knowledge directory', () => {
    const docs = knowledgeBase.getAllDocuments();
    expect(docs.length).toBeGreaterThan(5);
  });
});
