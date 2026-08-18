import assert from 'node:assert/strict';
import test from 'node:test';
import { buildCandidateWorkspace, buildDailyTrends, uniqueCandidates } from './jobService.js';

test('buildDailyTrends counts applications per local day and fills empty days with 0', () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  const trends = buildDailyTrends([
    new Date('2026-08-18T08:00:00.000Z'),
    new Date('2026-08-18T11:00:00.000Z'),
    new Date('2026-08-16T09:00:00.000Z'),
  ], 4, now);

  assert.equal(trends.length, 4);
  assert.deepEqual(trends.map((item) => item.value), [0, 1, 0, 2]);
});

test('uniqueCandidates keeps the strongest score and latest job per email', () => {
  const candidates = uniqueCandidates([
    {
      email: 'ada@example.com',
      fullName: 'Ada',
      matchScore: 70,
      createdAt: new Date('2026-08-01'),
      job: { title: 'Analyst' },
    },
    {
      email: 'ada@example.com',
      fullName: 'Ada Johnson',
      matchScore: 91,
      createdAt: new Date('2026-08-10'),
      job: { title: 'Engineer' },
    },
    {
      email: 'ben@example.com',
      fullName: 'Ben',
      matchScore: 80,
      createdAt: new Date('2026-08-03'),
      job: { title: 'Designer' },
    },
  ]);

  assert.equal(candidates.length, 2);
  assert.equal(candidates[0].email, 'ada@example.com');
  assert.equal(candidates[0].bestScore, 91);
  assert.equal(candidates[0].applications, 2);
  assert.equal(candidates[0].latestJobTitle, 'Engineer');
  assert.equal(candidates[0].fullName, 'Ada Johnson');
});

test('buildCandidateWorkspace counts real applications, companies, and weekly activity', () => {
  const now = new Date('2026-08-18T12:00:00.000Z');
  const workspace = buildCandidateWorkspace([
    {
      id: 1,
      matchScore: 80,
      semanticScore: 70,
      skillScore: 90,
      explanation: { summary: 'ok' },
      createdAt: new Date('2026-08-18T08:00:00.000Z'),
      job: {
        id: 10,
        title: 'Engineer',
        location: 'Remote',
        recruiter: { fullName: 'Pat', recruiterProfile: { companyName: 'Acme' } },
      },
    },
    {
      id: 2,
      matchScore: 90,
      semanticScore: 85,
      skillScore: 88,
      explanation: { summary: 'strong' },
      createdAt: new Date('2026-08-16T09:00:00.000Z'),
      job: {
        id: 11,
        title: 'Analyst',
        location: null,
        recruiter: { fullName: 'Pat', recruiterProfile: { companyName: 'Acme' } },
      },
    },
  ], now);

  assert.equal(workspace.stats.total, 2);
  assert.equal(workspace.stats.avgScore, 85);
  assert.equal(workspace.stats.companies, 1);
  assert.equal(workspace.stats.thisWeek, 2);
  assert.equal(workspace.applications[0].company, 'Acme');
  assert.equal(workspace.applications[0].jobTitle, 'Engineer');
});
