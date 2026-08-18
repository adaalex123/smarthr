const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it',
  'of', 'on', 'or', 'that', 'the', 'this', 'to', 'with', 'you', 'your', 'our', 'we',
  'will', 'can', 'must', 'have', 'has', 'using', 'use', 'used', 'etc', 'such',
]);

const ALIASES: Record<string, string> = {
  js: 'javascript',
  javascript: 'javascript',
  ts: 'typescript',
  typescript: 'typescript',
  node: 'nodejs',
  nodejs: 'nodejs',
  'node.js': 'nodejs',
  reactjs: 'react',
  'react.js': 'react',
  react: 'react',
  postgres: 'postgresql',
  postgresql: 'postgresql',
  k8s: 'kubernetes',
  kubernetes: 'kubernetes',
  ml: 'machine learning',
  'machine-learning': 'machine learning',
  nlp: 'natural language processing',
  bert: 'bert',
  py: 'python',
  python: 'python',
};

export type RankingExplanation = {
  matchedSkills: string[];
  missingSkills: string[];
  overlappingTerms: { term: string; jobWeight: number; resumeWeight: number }[];
  summary: string;
};

export type RankingResult = {
  matchScore: number;
  semanticScore: number;
  skillScore: number;
  explanation: RankingExplanation;
};

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9.+#]+/g, ' ')
    .split(/\s+/)
    .map((token) => ALIASES[token] ?? token)
    .flatMap((token) => token.split(' '))
    .filter((token) => token.length >= 2 && !STOPWORDS.has(token));
}

export function parseRequirements(raw: string): string[] {
  return raw
    .split(/[\n,;|/]+/)
    .map((item) => item.trim().toLowerCase())
    .map((item) => ALIASES[item] ?? item)
    .filter((item) => item.length >= 2);
}

export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let magA = 0;
  let magB = 0;
  for (let i = 0; i < a.length; i += 1) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

export function vectorize(tokens: string[], vocab: string[]): number[] {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return vocab.map((term) => counts.get(term) ?? 0);
}

function resumeHasSkill(resumeNormalized: string, skill: string): boolean {
  const needle = (ALIASES[skill] ?? skill).toLowerCase();
  return resumeNormalized.includes(needle);
}

function roundScore(value: number): number {
  return Math.round(Math.min(100, Math.max(0, value)) * 10) / 10;
}

export function rankResume(job: { description: string; requirements: string }, resumeText: string): RankingResult {
  const jobTokens = tokenize(`${job.description} ${job.requirements}`);
  const resumeTokens = tokenize(resumeText);
  const vocab = [...new Set(jobTokens)];
  const jobVector = vectorize(jobTokens, vocab);
  const resumeVector = vectorize(resumeTokens, vocab);
  const cosine = cosineSimilarity(jobVector, resumeVector);

  const requiredSkills = [...new Set(parseRequirements(job.requirements))];
  const resumeNormalized = tokenize(resumeText).join(' ');
  const matchedSkills = requiredSkills.filter((skill) => resumeHasSkill(resumeNormalized, skill));
  const missingSkills = requiredSkills.filter((skill) => !matchedSkills.includes(skill));
  const skillRatio = requiredSkills.length === 0 ? cosine : matchedSkills.length / requiredSkills.length;

  const semanticScore = roundScore(cosine * 100);
  const skillScore = roundScore(skillRatio * 100);
  const matchScore = requiredSkills.length === 0
    ? semanticScore
    : roundScore((0.55 * cosine + 0.45 * skillRatio) * 100);

  const overlappingTerms = vocab
    .map((term, index) => ({
      term,
      jobWeight: jobVector[index],
      resumeWeight: resumeVector[index],
    }))
    .filter((item) => item.resumeWeight > 0)
    .sort((a, b) => (b.jobWeight * b.resumeWeight) - (a.jobWeight * a.resumeWeight))
    .slice(0, 8);

  const skillPart = requiredSkills.length
    ? `Matched ${matchedSkills.length} of ${requiredSkills.length} required skills.`
    : 'No explicit required skills were listed, so ranking used job-description overlap only.';
  const summary = `${skillPart} Semantic similarity to the job description is ${semanticScore}%.`;

  return {
    matchScore,
    semanticScore,
    skillScore,
    explanation: {
      matchedSkills,
      missingSkills,
      overlappingTerms,
      summary,
    },
  };
}
