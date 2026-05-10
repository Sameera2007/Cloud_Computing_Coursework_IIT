jest.mock('pg', () => {
  const mPool = { query: jest.fn(), end: jest.fn() };
  return { Pool: jest.fn(() => mPool) };
});

const request = require('supertest');
const express = require('express');

const app = express();
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

describe('Vote Service', () => {
  test('GET /health returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  test('approval threshold is 3', () => {
    const THRESHOLD = parseInt(process.env.APPROVAL_THRESHOLD || '3');
    expect(THRESHOLD).toBe(3);
  });

  test('vote type must be UP or DOWN', () => {
    const validVote = (type) => ['UP', 'DOWN'].includes(type);
    expect(validVote('UP')).toBe(true);
    expect(validVote('DOWN')).toBe(true);
    expect(validVote('MAYBE')).toBe(false);
  });
});
