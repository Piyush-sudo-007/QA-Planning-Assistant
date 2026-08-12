import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const KNOWLEDGE_DIR = path.join(__dirname, '../knowledge');

let knowledgeBaseCache = null;

function loadKnowledgeBase() {
  if (knowledgeBaseCache) return knowledgeBaseCache;

  const docs = [];
  try {
    if (!fs.existsSync(KNOWLEDGE_DIR)) {
      fs.mkdirSync(KNOWLEDGE_DIR, { recursive: true });
    }

    const files = fs.readdirSync(KNOWLEDGE_DIR).filter((f) => f.endsWith('.md'));
    for (const file of files) {
      const filePath = path.join(KNOWLEDGE_DIR, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const id = path.basename(file, '.md');
      const title = id
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      // Simple keyword extraction (words with length > 3, excluding common stop words)
      const words = content
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 3);

      const keywordFreq = {};
      for (const word of words) {
        keywordFreq[word] = (keywordFreq[word] || 0) + 1;
      }

      docs.push({
        id,
        title,
        filename: file,
        content,
        keywords: keywordFreq,
      });
    }
  } catch (err) {
    console.error('[KnowledgeBase] Error loading knowledge files:', err.message);
  }

  knowledgeBaseCache = docs;
  return docs;
}

export function retrieveRelevant(requirementText = '', implementationSummary = '', topK = 4) {
  const docs = loadKnowledgeBase();
  if (docs.length === 0) return [];

  const queryText = `${requirementText} ${implementationSummary}`.toLowerCase();
  const queryWords = queryText
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3);

  const scoredDocs = docs.map((doc) => {
    let score = 0;
    for (const word of queryWords) {
      if (doc.keywords[word]) {
        score += doc.keywords[word];
      }
    }
    // Also match doc ID or title directly
    for (const word of queryWords) {
      if (doc.id.includes(word) || doc.title.toLowerCase().includes(word)) {
        score += 10;
      }
    }
    return { ...doc, score };
  });

  scoredDocs.sort((a, b) => b.score - a.score);

  // Return topK documents (or all if topK > docs.length)
  return scoredDocs.slice(0, Math.min(topK, docs.length)).map(({ keywords, score, ...rest }) => rest);
}

export function getAllDocuments() {
  return loadKnowledgeBase().map(({ keywords, ...rest }) => rest);
}

export default { retrieveRelevant, getAllDocuments };
