export const TEST_TYPES = {
  unit: { label: 'Unit Test', color: '#06b6d4', icon: 'Code' },
  api: { label: 'API Test', color: '#8b5cf6', icon: 'Server' },
  integration: { label: 'Integration Test', color: '#3b82f6', icon: 'Layers' },
  e2e: { label: 'E2E Test', color: '#10b981', icon: 'Workflow' },
  playwright: { label: 'Playwright Test', color: '#22c55e', icon: 'Terminal' },
  manual: { label: 'Manual QA', color: '#f59e0b', icon: 'UserCheck' },
};

export const TEST_STATUSES = {
  proposed: { label: 'Proposed', color: '#f59e0b', badgeClass: 'badge-proposed' },
  approved: { label: 'Approved', color: '#10b981', badgeClass: 'badge-approved' },
  rejected: { label: 'Rejected', color: '#ef4444', badgeClass: 'badge-rejected' },
  edited: { label: 'Edited', color: '#06b6d4', badgeClass: 'badge-edited' },
};

export const PRIORITIES = {
  critical: { label: 'Critical', color: '#ef4444', badgeClass: 'badge-critical' },
  high: { label: 'High', color: '#f59e0b', badgeClass: 'badge-high' },
  medium: { label: 'Medium', color: '#06b6d4', badgeClass: 'badge-medium' },
  low: { label: 'Low', color: '#64748b', badgeClass: 'badge-low' },
};

export const CATEGORIES = {
  happy_path: { label: 'Happy Path', icon: 'CheckCircle' },
  edge_case: { label: 'Edge Case', icon: 'AlertTriangle' },
  permission: { label: 'Permission Boundary', icon: 'ShieldAlert' },
  failure_state: { label: 'Failure State', icon: 'XCircle' },
  regression: { label: 'Regression Risk', icon: 'History' },
};
