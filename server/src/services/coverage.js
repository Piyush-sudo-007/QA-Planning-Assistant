/**
 * Deterministic Coverage Calculation & Quality Analysis Service
 */

/**
 * Calculate Jaccard similarity between two strings based on character n-grams or word sets
 */
function jaccardSimilarity(str1 = '', str2 = '') {
  const set1 = new Set(str1.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));
  const set2 = new Set(str2.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(Boolean));

  if (set1.size === 0 && set2.size === 0) return 1.0;
  if (set1.size === 0 || set2.size === 0) return 0.0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return intersection / union;
}

/**
 * Calculates acceptance criteria coverage deterministically.
 * An acceptance criterion is covered ONLY IF at least one APPROVED test case maps to it.
 * (If status filter is omitted, non-rejected test cases can be checked or approved specifically)
 */
export function calculateCoverage(acceptanceCriteria = [], testCases = []) {
  if (!Array.isArray(acceptanceCriteria) || acceptanceCriteria.length === 0) {
    return { score: 0, covered: [], uncovered: [], total: 0, details: [] };
  }

  // Filter test cases to approved/proposed/edited (exclude rejected)
  const activeTestCases = testCases.filter((tc) => tc.status !== 'rejected');
  const approvedTestCases = testCases.filter((tc) => tc.status === 'approved' || tc.status === 'edited');

  // Track which AC indices are mapped by active tests vs approved tests
  const mappedIndicesActive = new Set();
  const mappedIndicesApproved = new Set();

  const details = acceptanceCriteria.map((criterion, index) => {
    // Find matching tests for this criterion index
    const matchingTests = testCases.filter((tc) => {
      let mapped = tc.mapped_criteria || tc.mappedCriteria || [];
      if (typeof mapped === 'string') {
        try { mapped = JSON.parse(mapped); } catch (e) { mapped = []; }
      }
      return Array.isArray(mapped) && mapped.includes(index);
    });

    const activeTests = matchingTests.filter((tc) => tc.status !== 'rejected');
    const approvedTests = matchingTests.filter((tc) => tc.status === 'approved' || tc.status === 'edited');

    const isCoveredActive = activeTests.length > 0;
    const isCoveredApproved = approvedTests.length > 0;

    if (isCoveredActive) mappedIndicesActive.add(index);
    if (isCoveredApproved) mappedIndicesApproved.add(index);

    return {
      index,
      text: criterion,
      isCovered: isCoveredActive,
      isApprovedCovered: isCoveredApproved,
      testCount: activeTests.length,
      approvedTestCount: approvedTests.length,
      matchingTestIds: activeTests.map((t) => t.id),
    };
  });

  const coveredCount = mappedIndicesActive.size;
  const approvedCoveredCount = mappedIndicesApproved.size;
  const totalCount = acceptanceCriteria.length;

  const score = Math.round((coveredCount / totalCount) * 100);
  const approvedScore = Math.round((approvedCoveredCount / totalCount) * 100);

  const covered = details.filter((d) => d.isCovered).map((d) => ({ index: d.index, text: d.text }));
  const uncovered = details.filter((d) => !d.isCovered).map((d) => ({ index: d.index, text: d.text }));

  return {
    score,
    approvedScore,
    covered,
    uncovered,
    total: totalCount,
    details,
  };
}

/**
 * Detect duplicate test cases using text similarity on title & description
 */
export function detectDuplicates(testCases = [], threshold = 0.6) {
  const duplicates = [];

  for (let i = 0; i < testCases.length; i++) {
    for (let j = i + 1; j < testCases.length; j++) {
      const tc1 = testCases[i];
      const tc2 = testCases[j];

      const text1 = `${tc1.title} ${tc1.description}`;
      const text2 = `${tc2.title} ${tc2.description}`;

      const similarity = jaccardSimilarity(text1, text2);
      if (similarity >= threshold) {
        duplicates.push({
          testId1: tc1.id,
          testId2: tc2.id,
          title1: tc1.title,
          title2: tc2.title,
          similarity: Math.round(similarity * 100) / 100,
        });
      }
    }
  }

  return duplicates;
}

/**
 * Detect incomplete test cases (missing required fields like steps for manual/e2e, or missing relevance)
 */
export function detectIncomplete(testCases = []) {
  const incomplete = [];

  for (const tc of testCases) {
    const issues = [];

    if (!tc.title || tc.title.trim().length < 5) {
      issues.push('Title is too short or missing');
    }
    if (!tc.description || tc.description.trim().length < 10) {
      issues.push('Description is too short or missing');
    }
    if (!tc.relevance || tc.relevance.trim().length < 10) {
      issues.push('Relevance explanation is missing');
    }

    let steps = tc.steps;
    if (typeof steps === 'string') {
      try { steps = JSON.parse(steps); } catch (e) { steps = []; }
    }
    if ((tc.type === 'manual' || tc.type === 'e2e' || tc.type === 'playwright') && (!Array.isArray(steps) || steps.length === 0)) {
      issues.push(`Test type '${tc.type}' requires test steps`);
    }

    let mapped = tc.mapped_criteria || tc.mappedCriteria || [];
    if (typeof mapped === 'string') {
      try { mapped = JSON.parse(mapped); } catch (e) { mapped = []; }
    }
    if (!Array.isArray(mapped) || mapped.length === 0) {
      issues.push('Not mapped to any acceptance criteria');
    }

    if (issues.length > 0) {
      incomplete.push({
        testId: tc.id,
        title: tc.title,
        issues,
      });
    }
  }

  return incomplete;
}

/**
 * Comprehensive quality analysis combining coverage, duplicates, and incomplete tests
 */
export function analyzeQuality(acceptanceCriteria = [], testCases = []) {
  const coverage = calculateCoverage(acceptanceCriteria, testCases);
  const duplicates = detectDuplicates(testCases);
  const incomplete = detectIncomplete(testCases);

  const duplicateTestIds = new Set();
  duplicates.forEach((d) => {
    duplicateTestIds.add(d.testId1);
    duplicateTestIds.add(d.testId2);
  });

  const incompleteTestIds = new Set(incomplete.map((i) => i.testId));

  // Annotate test cases with flags
  const annotatedTestCases = testCases.map((tc) => ({
    ...tc,
    is_duplicate: duplicateTestIds.has(tc.id) ? 1 : 0,
    is_incomplete: incompleteTestIds.has(tc.id) ? 1 : 0,
  }));

  return {
    coverage,
    duplicates,
    incomplete,
    annotatedTestCases,
    qualityScore: Math.max(0, coverage.score - duplicates.length * 5 - incomplete.length * 5),
  };
}

export default { calculateCoverage, detectDuplicates, detectIncomplete, analyzeQuality };
