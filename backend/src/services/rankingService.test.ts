import assert from 'node:assert/strict';
import test from 'node:test';
import { cosineSimilarity, parseRequirements, rankResume, vectorize } from './rankingService.js';

test('cosine similarity is 1 for identical vectors', () => {
  assert.equal(cosineSimilarity([1, 2, 3], [1, 2, 3]), 1);
});

test('cosine similarity is 0 for orthogonal vectors', () => {
  assert.equal(cosineSimilarity([1, 0], [0, 1]), 0);
});

test('vectorize counts terms against a fixed vocabulary', () => {
  assert.deepEqual(vectorize(['react', 'node', 'react'], ['react', 'python', 'node']), [2, 0, 1]);
});

test('parseRequirements splits and normalizes aliases', () => {
  assert.deepEqual(parseRequirements('JS, React.js, PostgreSQL'), ['javascript', 'react', 'postgresql']);
});

test('rankResume scores a strong match highly and explains matched skills', () => {
  const result = rankResume(
    {
      description: 'We need a React and Node.js engineer to build APIs and dashboards.',
      requirements: 'React, Node.js, TypeScript, PostgreSQL',
    },
    'Senior frontend engineer. Built React dashboards with TypeScript. Node.js APIs on PostgreSQL.',
  );

  assert.ok(result.matchScore >= 70, `expected high match, got ${result.matchScore}`);
  assert.ok(result.explanation.matchedSkills.includes('react'));
  assert.ok(result.explanation.matchedSkills.includes('postgresql'));
  assert.equal(result.explanation.missingSkills.length, 0);
  assert.ok(result.explanation.overlappingTerms.some((term) => term.term === 'react'));
  assert.match(result.explanation.summary, /Matched 4 of 4/);
});

test('rankResume flags missing skills and lowers the score', () => {
  const result = rankResume(
    {
      description: 'Hiring a machine learning engineer for NLP and BERT ranking.',
      requirements: 'Python, BERT, NLP, TensorFlow',
    },
    'Customer support specialist with Excel and call-center experience.',
  );

  assert.ok(result.matchScore < 40, `expected a low match, got ${result.matchScore}`);
  assert.ok(result.explanation.missingSkills.includes('python'));
  assert.ok(result.explanation.missingSkills.includes('bert'));
  assert.equal(result.explanation.matchedSkills.length, 0);
});
