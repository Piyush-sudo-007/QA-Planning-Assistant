import { describe, it, expect } from 'vitest';
import { calculateCoverage, detectDuplicates, detectIncomplete } from '../../src/services/coverage.js';

describe('Coverage & Quality Service', () => {
  it('should calculate 100% coverage when all criteria are mapped to active tests', () => {
    const acs = ['User must log in', 'Token must be saved'];
    const testCases = [
      { id: '1', mapped_criteria: [0], status: 'approved' },
      { id: '2', mapped_criteria: [1], status: 'proposed' },
    ];

    const result = calculateCoverage(acs, testCases);
    expect(result.score).toBe(100);
    expect(result.covered.length).toBe(2);
    expect(result.uncovered.length).toBe(0);
  });

  it('should identify uncovered criteria when test cases are missing', () => {
    const acs = ['Requirement 1', 'Requirement 2', 'Requirement 3'];
    const testCases = [
      { id: '1', mapped_criteria: [0], status: 'approved' },
    ];

    const result = calculateCoverage(acs, testCases);
    expect(result.score).toBe(33);
    expect(result.uncovered.length).toBe(2);
    expect(result.uncovered[0].index).toBe(1);
  });

  it('should detect duplicate test cases using Jaccard text similarity', () => {
    const testCases = [
      { id: 't1', title: 'Test user login with valid credentials', description: 'Enter username and password' },
      { id: 't2', title: 'Test user login with valid credentials', description: 'Enter username and password' },
      { id: 't3', title: 'Verify database connection timeout', description: 'Simulate packet drop' },
    ];

    const duplicates = detectDuplicates(testCases, 0.7);
    expect(duplicates.length).toBe(1);
    expect(duplicates[0].testId1).toBe('t1');
    expect(duplicates[0].testId2).toBe('t2');
  });

  it('should detect incomplete test cases missing required fields', () => {
    const testCases = [
      { id: '1', type: 'manual', title: 'Valid Test Title', description: 'Short', relevance: '' },
      { id: '2', type: 'unit', title: 'Complete Unit Test Title', description: 'Detailed description string', relevance: 'Relevant explanation', mapped_criteria: [0] },
    ];

    const incomplete = detectIncomplete(testCases);
    expect(incomplete.length).toBe(1);
    expect(incomplete[0].testId).toBe('1');
  });
});
